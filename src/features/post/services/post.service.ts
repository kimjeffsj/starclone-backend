import { AppDataSource } from "@/config/database";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import {
  createPostInput,
  getPostsQueryInput,
  updatePostInput,
} from "../validations/post.schema";
import { NotFoundError, ValidationError } from "@/utils/errors.utils";
import { In } from "typeorm";
import { Media } from "@/entities/Media.entity";
import { deleteMedia } from "@/utils/s3.utils";

export class PostService {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);
  private mediaRepository = AppDataSource.getRepository(Media);

  // Create Post
  async createPost(userId: string, postData: createPostInput) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create post
      const newPost = queryRunner.manager.create(Post, {
        caption: postData.caption,
        location: postData.location,
        user,
      });

      // Save post
      await queryRunner.manager.save(newPost);

      if (postData.mediaIds && postData.mediaIds.length > 0) {
        const mediaItems = await queryRunner.manager.find(Media, {
          where: { id: In(postData.mediaIds) },
        });

        if (mediaItems.length !== postData.mediaIds.length) {
          throw new ValidationError({
            message: "One or more media IDs are invalid",
          });
        }

        // Connect media to post
        for (const media of mediaItems) {
          // 다른 사용자의 미디어가 아닌지 확인 (추가 보안 검사)
          // 이 부분은 미디어에 사용자 ID가 저장되어 있다면 추가할 수 있음
          media.post = newPost;
          await queryRunner.manager.save(media);
        }
      }

      await queryRunner.commitTransaction();

      return this.postRepository.findOne({
        where: { id: newPost.id },
        relations: ["user", "media"],
      });
    } catch (error) {
      // Rollback when error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Always release query runner
      await queryRunner.release();
    }
  }

  // Get posts
  async getPosts(currentUserId: string, queryOptions: getPostsQueryInput) {
    const { page, limit, userId, sortBy, order } = queryOptions;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .take(limit)
      .skip(skip)
      .orderBy(`post.${sortBy}`, order === "asc" ? "ASC" : "DESC");

    // Query for certain user
    if (userId) {
      queryBuilder.andWhere("user.id = :userId", { userId });
    } else {
      // TODO: Showing only followed user's posts.
      // Showing everyone for now
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      totalPages,
    };
  }

  // Get a post by id
  async getPostById(postId: string, currentUserId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ["user", "media"],
      order: {
        media: {
          createdAt: "ASC",
        },
      },
    });

    if (!post) {
      return null;
    }

    return post;
  }

  // Update post
  async updatePost(postId: string, updateData: updatePostInput) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Query the post
      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
        relations: ["media"],
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Update post
      if (updateData.caption !== undefined) {
        post.caption = updateData.caption;
      }
      if (updateData.location !== undefined) {
        post.location = updateData.location;
      }

      // Save the post
      await queryRunner.manager.save(post);

      // Delete media
      if (updateData.removeMediaIds && updateData.removeMediaIds.length > 0) {
        // Query media to delete
        const mediaToRemove = await queryRunner.manager.find(Media, {
          where: {
            id: In(updateData.removeMediaIds),
            post: { id: postId },
          },
        });

        // Media file delete from S3
        for (const media of mediaToRemove) {
          try {
            await deleteMedia(media.mediaUrl);
            if (media.thumbnailUrl) {
              await deleteMedia(media.thumbnailUrl);
            }
          } catch (error) {
            console.error("Failed to delete file from S3: ", error);
          }
          // Delete from DB
          await queryRunner.manager.remove(media);
        }
      }

      // Add new Media
      if (updateData.mediaIds && updateData.mediaIds.length > 0) {
        const mediaToAdd = await queryRunner.manager.find(Media, {
          where: { id: In(updateData.mediaIds) },
          relations: ["post"],
        });

        if (mediaToAdd.length !== updateData.mediaIds.length) {
          throw new ValidationError({
            message: "One or more media IDs are invalid",
          });
        }

        // Check if media connected to other post
        const alreadyAttachedMedia = mediaToAdd.filter(
          (media) => media.post && media.post.id !== postId
        );

        if (alreadyAttachedMedia.length > 0) {
          throw new ValidationError({
            message:
              "One or more media items are already attached to another post",
          });
        }

        // Connect media to post
        for (const media of mediaToAdd) {
          media.post = post;
          await queryRunner.manager.save(media);
        }
      }

      await queryRunner.commitTransaction();

      return this.postRepository.findOne({
        where: { id: postId },
        relations: ["user", "media"],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Update media order
  async updateMediaOrder(
    postId: string,
    mediaOrder: { mediaId: string; order: number }[]
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Query post
      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Query media Id
      const mediaItems = await queryRunner.manager.find(Media, {
        where: { post: { id: postId } },
        select: ["id"],
      });

      const postMediaIds = mediaItems.map((media) => media.id);

      // Check ownership
      const allMediaBelongToPost = mediaOrder.every((item) =>
        postMediaIds.includes(item.mediaId)
      );

      if (!allMediaBelongToPost) {
        throw new ValidationError({
          message:
            "Cannot update order of media that down not belong to this post",
        });
      }

      for (const item of mediaOrder) {
        await queryRunner.manager.update(
          Media,
          { id: item.mediaId },
          { order: item.order }
        );
      }

      // Transaction commit
      await queryRunner.commitTransaction();

      return this.postRepository.findOne({
        where: { id: postId },
        relations: ["media"],
        order: {
          media: {
            order: "ASC",
          },
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Delete post
  async deletePost(postId: string) {
    await this.postRepository.delete(postId);
    return true;
  }

  // Check author of the post
  async checkPostAuthor(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ["user"],
    });

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post.user.id === userId;
  }
}
