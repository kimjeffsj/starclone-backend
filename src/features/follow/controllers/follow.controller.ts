import { NextFunction, Request, Response } from "express";
import { FollowService } from "../services/follow.service";
import { followUserSchema } from "../validations/follow.schema";
import { UnauthorizedError, ValidationError } from "@/utils/errors.utils";

export class FollowController {
  private followService = new FollowService();

  /**
   * Follow a user
   */
  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const validationResult = followUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const result = await this.followService.followUser(
        req.user.id,
        validationResult.data.username
      );

      res.status(200).json({
        message: "Successfully followed user",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unfollow a user
   */
  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { username } = req.params;

      const result = await this.followService.unfollowUser(
        req.user.id,
        username
      );

      res.status(200).json({
        message: "Successfully unfollowed user",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check follow status
   */
  checkFollowStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { username } = req.params;

      const result = await this.followService.checkFollowStatus(
        req.user.id,
        username
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get followers of a user
   */
  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.followService.getFollowers(
        username,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users that a user is following
   */
  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.followService.getFollowing(
        username,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get follow counts
   */
  getFollowCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;

      const result = await this.followService.getFollowCounts(username);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
