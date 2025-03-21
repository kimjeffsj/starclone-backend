import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/utils/errors.utils";
import { NextFunction, Request, Response } from "express";
import {
  deleteMediaSchema,
  uploadMediaSchema,
} from "../validations/media.schema";
import { MediaService } from "../services/media.service";

export class MediaController {
  private mediaService = new MediaService();

  /**
   * Upload media
   */

  uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not Authenticated");
      }

      if (!req.file) {
        throw new ValidationError({ message: "No file uploaded" });
      }

      // Validate request
      const validationResult = uploadMediaSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const media = await this.mediaService.uploadMedia(
        req.user.id,
        req.file,
        validationResult.data
      );

      res.status(201).json({
        message: "Media uploaded successfully",
        media,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete media
   */
  deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not authenticated");
      }

      // Request validation
      const validationResult = deleteMediaSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      await this.mediaService.deleteMedia(
        req.user.id,
        validationResult.data.mediaId
      );

      res.status(200).json({
        message: "Media deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Query media
   */
  getMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const media = await this.mediaService.getMediaById(id);

      if (!media) {
        throw new NotFoundError("Failed to fetch media");
      }

      res.status(200).json({ media });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Query list of the media with post id
   */
  getPostMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const mediaList = await this.mediaService.getMediaByPostId(postId);

      res.status(200).json({ media: mediaList });
    } catch (error) {
      next(error);
    }
  };
}
