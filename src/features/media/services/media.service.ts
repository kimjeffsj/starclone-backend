import { AppDataSource } from "@/config/database";
import { Media, MediaType } from "@/entities/Media.entity";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import { UploadMediaInput } from "../validations/media.schema";
import { NotFoundError, ValidationError } from "@/utils/errors.utils";
import { deleteMedia, uploadImage } from "@/utils/s3.utils";
import { NextFunction } from "express";

export class MediaService {
  private mediaRepository = AppDataSource.getRepository(Media);
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Upload media (profile image or post media)
   */
  async uploadMedia(
    userId: string,
    file: Express.Multer.File,
    options: UploadMediaInput
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Resizing
    const resizeOptions = options.resize || {
      width: 1080,
      quality: 80,
    };

    // Upload to S3
    const { mediaUrl, width, height } = await uploadImage(file, resizeOptions);

    const type = file.mimetype.startsWith("video/")
      ? MediaType.VIDEO
      : MediaType.IMAGE;

    if (options.type === "profile") {
      // If profile image exist, delete old one
      if (user.profileImageUrl) {
        try {
          await deleteMedia(user.profileImageUrl);
        } catch (error) {
          console.error("Failed to delete old profile image: ", error);
        }
      }

      // Update profile image
      user.profileImageUrl = mediaUrl;
      await this.userRepository.save(user);

      return { mediaUrl, width, height };
    } else if (options.type === "post") {
      if (options.postId) {
        const post = await this.postRepository.findOne({
          where: { id: options.postId },
          relations: ["user"],
        });

        if (!post) {
          throw new NotFoundError("Post not found");
        }

        // Check the author
        if (post.user.id !== userId) {
          throw new ValidationError({
            message: "You can only add media to your own account",
          });
        }

        const media = this.mediaRepository.create({
          mediaUrl,
          post,
          type,
          width,
          height,
        });

        await this.mediaRepository.save(media);
        return media;
      }

      // if no postId save temporality
      else {
        const media = this.mediaRepository.create({
          mediaUrl,
          type,
          width,
          height,
        });

        await this.mediaRepository.save(media);
        return media;
      }
    }

    throw new ValidationError({ message: "Invalid media type" });
  }

  /**
   * Delete media
   */
  async deleteMedia(userId: string, mediaId: string) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ["post", "post.user"],
    });

    if (!media) {
      throw new NotFoundError("Media not found");
    }

    // Check auth
    if (media.post && media.post.user && media.post.user.id !== userId) {
      throw new ValidationError({
        message: "You can only delete your own media",
      });
    }

    // Delete from S3
    try {
      await deleteMedia(media.mediaUrl);
    } catch (error) {
      console.error("Failed to delete media from S3: ", error);
    }

    // Delete from DB
    await this.mediaRepository.remove(media);
    return { success: true };
  }

  /**
   * Get a Media by Id
   */
  async getMediaById(mediaId: string) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundError("Media not found");
    }

    return media;
  }

  async getMediaByPostId(postId: string) {
    const media = await this.mediaRepository.find({
      where: { post: { id: postId } },
      order: { createdAt: "ASC" },
    });

    return media;
  }
}
