import { NextFunction, Request, Response } from "express";
import {
  createPostSchema,
  getPostsQuerySchema,
  updatePostSchema,
} from "../validations/post.schema";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/utils/errors.utils";
import { postService } from "..";

export class PostController {
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Request validation
      const validationResult = createPostSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not Authenticated");
      }

      const newPost = await postService.createPost(
        req.user.id,
        validationResult.data
      );

      res.status(201).json({
        message: "New post created successfully",
        newPost,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  // Get posts
  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // validate query
      const validationResult = getPostsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const { posts, total, totalPages } = await postService.getPosts(
        req.user.id,
        validationResult.data
      );

      res.status(200).json({
        posts,
        meta: {
          total,
          totalPages,
          page: validationResult.data.page,
          limit: validationResult.data.limit,
        },
      });

      return;
    } catch (error) {
      next(error);
    }
  };

  // Get a post by id
  getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { id } = req.params;
      const post = await postService.getPostById(id, req.user.id);

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      res.status(200).json({ post });

      return;
    } catch (error) {
      next(error);
    }
  };

  // Update post
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // Request Validation
      const validationResult = updatePostSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const { id } = req.params;

      // Check if post exist
      const postExists = await postService.checkPostAuthor(id, req.user.id);
      if (!postExists) {
        throw new ForbiddenError(
          "Update failed, you are not author of this post"
        );
      }

      // Update post
      const updatedPost = await postService.updatePost(
        id,
        validationResult.data
      );

      res.status(200).json({
        message: "Post updated successfully",
        post: updatedPost,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  // Delete post
  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { id } = req.params;

      const postExists = await postService.checkPostAuthor(id, req.user.id);
      if (!postExists) {
        throw new ForbiddenError(
          "Delete failed, you are not author of this post"
        );
      }

      await postService.deletePost(id);

      res.status(200).json({
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
