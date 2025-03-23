import { AppDataSource } from "@/config/database";
import { Like } from "@/entities/Like.entity";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import { NotFoundError, ValidationError } from "@/utils/errors.utils";

export class LikeService {
  private likeRepository = AppDataSource.getRepository(Like);
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Like post
   */
  async likePost(userId: string, postId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Query user and post
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundError("User not found");
      }

      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ["user"],
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Check if already liked
      const existingLike = await this.likeRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (existingLike) {
        throw new ValidationError({ message: "Already liked this post" });
      }

      // Add Like
      const like = this.likeRepository.create({
        user,
        post,
      });

      await queryRunner.manager.save(like);

      // Add count to like
      post.likeCount = (post.likeCount || 0) + 1;
      await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();

      return { success: true, likeCount: post.likeCount };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cancel like
   */
  async unlikePost(userId: string, postId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Query like
      const like = await this.likeRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
        relations: ["post"],
      });

      if (!like) {
        throw new ValidationError({ message: "You haven't liked this post" });
      }

      // Query post
      const post = await this.postRepository.findOneBy({ id: postId });
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Unlike the post
      await queryRunner.manager.remove(like);

      // Decrease like count
      post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();

      return { success: true, likeCount: post.likeCount };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   *
   */
  async checkLikeStatus(userId: string, postId: string) {
    const like = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    return { liked: !!like };
  }

  /**
   *
   */
  async getPostLikes(postId: string, page = 1, limit = 20) {
    // Query post
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const skip = (page - 1) * limit;

    const [likes, total] = await this.likeRepository
      .createQueryBuilder("like")
      .leftJoinAndSelect("like.user", "user")
      .where("like.post.id = :postId", { postId })
      .skip(skip)
      .take(limit)
      .orderBy("like.createdAt", "DESC")
      .getManyAndCount();

    // Extract only user
    const users = likes.map((like) => like.user);

    return {
      likes: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
