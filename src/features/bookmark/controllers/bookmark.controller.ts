import { NextFunction, Request, Response } from "express";
import { BookmarkService } from "../services/bookmark.service";
import { UnauthorizedError, ValidationError } from "@/utils/errors.utils";
import { bookmarkSchema } from "../validations/bookmark.schema";

export class BookmarkController {
  private bookmarkService = new BookmarkService();

  /**
   * Add bookmark
   */
  addBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }
      // Validate request
      const validationResult = bookmarkSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const result = await this.bookmarkService.addBookmark(
        req.user.id,
        validationResult.data.postId
      );

      res.status(200).json({
        message: "Post bookmarked successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove bookmark
   */
  removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { postId } = req.params;

      const result = await this.bookmarkService.removeBookmark(
        req.user.id,
        postId
      );

      res.status(200).json({
        message: "Bookmark removed successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bookmark status
   */
  checkBookmarkStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { postId } = req.params;

      const result = await this.bookmarkService.checkBookmarkStatus(
        req.user.id,
        postId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get bookmarked posts
   */
  getBookmarkedPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.page ? parseInt(req.query.limit as string) : 10;

      const result = await this.bookmarkService.getBookmarkedPosts(
        req.user.id,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
