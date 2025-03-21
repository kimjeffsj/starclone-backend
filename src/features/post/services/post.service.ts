import { AppDataSource } from "@/config/database";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import {
  createPostInput,
  getPostsQueryInput,
  updatePostInput,
} from "../validations/post.schema";
import { NotFoundError } from "@/utils/errors.utils";
import { Response } from "express";

export class PostService {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  // Create Post
  async createPost(userId: string, postData: createPostInput) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newPost = this.postRepository.create({
      ...postData,
      user,
    });

    await this.postRepository.save(newPost);
    return newPost;
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
      relations: ["user"],
    });

    if (!post) {
      return null;
    }

    return post;
  }

  // Update post
  async updatePost(postId: string, updateData: updatePostInput) {
    await this.postRepository.update(postId, updateData);

    const updatedPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ["user"],
    });

    if (!updatedPost) {
      throw new NotFoundError("Post not found");
    }

    return updatedPost;
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
