import { NextFunction, Request, Response } from "express";

import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "@/utils/errors.utils";
import { updateProfileSchema } from "../validations/user.schema";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  /**
   * Get user profile by username
   */
  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;

      const user = await this.userService.getUserByUsername(username);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      res.status(200).json({
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // Validate request
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const updatedUser = await this.userService.updateProfile(
        req.user.id,
        validationResult.data
      );

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get posts by username
   */
  getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await this.userService.getUserPosts(username, page, limit);

      res.status(200).json({
        posts: result.posts,
        meta: {
          total: result.total,
          totalPages: result.totalPages,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search users by username or fullName
   */
  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!query || typeof query !== "string") {
        throw new ValidationError({ message: "Search query is required" });
      }

      const { users, total, totalPages } = await this.userService.searchUsers(
        query,
        page,
        limit
      );

      res.status(200).json({
        users,
        meta: {
          total,
          totalPages,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
