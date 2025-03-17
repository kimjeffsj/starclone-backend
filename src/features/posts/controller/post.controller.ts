import { NextFunction, Request, Response } from "express";
import { createPostSchema } from "../validations/post.schema";
import { UnauthorizedError, ValidationError } from "@/utils/errors.utils";
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
}
