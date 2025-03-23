import { NextFunction, Request, Response } from "express";
import { LikeService } from "../services/like.service";
import { likeSchema } from "../validations/like.schema";
import { UnauthorizedError, ValidationError } from "@/utils/errors.utils";

export class LikeController {
  private likeService = new LikeService();

  /**
   * Like post
   */
  likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // Validate request
      const validationResult = likeSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const result = await this.likeService.likePost(
        req.user.id,
        validationResult.data.postId
      );

      res.status(200).json({
        message: "Post liked successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unlike post
   */
  unlikePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { postId } = req.params;

      const result = await this.likeService.unlikePost(req.user.id, postId);

      res.status(200).json({
        message: "Post unliked successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check like status
   */
  checkLikeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { postId } = req.params;

      const result = await this.likeService.checkLikeStatus(
        req.user.id,
        postId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Query liked list
   */
  getPostLikes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.likeService.getPostLikes(postId, page, limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
