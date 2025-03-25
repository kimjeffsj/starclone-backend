import { NextFunction, Request, Response } from "express";
import {
  createCommentSchema,
  getCommentsQuerySchema,
  updateCommentSchema,
} from "../validations/comment.schema";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/utils/errors.utils";
import { CommentService } from "../services/comment.service";

export class CommentController {
  private commentService = new CommentService();

  /**
   * Create comment
   */
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // Validate request
      const validationResult = createCommentSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const comment = await this.commentService.createComment(
        req.user.id,
        validationResult.data
      );

      res.status(201).json({
        message: "Comment created successfully",
        comment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Query comments by post
   */
  getCommentsByPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId } = req.params;

      // Validate request
      const validationResult = getCommentsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const { comments, total, totalPages } =
        await this.commentService.getCommentsByPost(
          postId,
          validationResult.data
        );

      res.status(200).json({
        comments,
        meta: {
          total,
          totalPages,
          page: validationResult.data.page,
          limit: validationResult.data.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update comment
   */
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { id } = req.params;

      // Validate Request
      const validationResult = updateCommentSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      // Check author of comment
      const isAuthor = await this.commentService.checkCommentAuthor(
        id,
        req.user.id
      );
      if (!isAuthor) {
        throw new ForbiddenError("You can only update your own comments");
      }

      const comment = await this.commentService.updateComment(
        id,
        validationResult.data
      );

      res.status(200).json({
        message: "Comment updated successfully",
        comment,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete comment
   */
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { id } = req.params;

      // Check author
      const isAuthor = await this.commentService.checkCommentAuthor(
        id,
        req.user.id
      );
      if (!isAuthor) {
        throw new ForbiddenError("You can only delete your own comments");
      }

      await this.commentService.deleteComment(id);

      res.status(200).json({
        message: "Comment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
