import express from "express";
import { MediaController } from "../controllers/media.controller";
import { authenticate } from "@/features/auth";
import { uploadSingleImage } from "@/utils/upload.middleware";

const router = express.Router();
const mediaController = new MediaController();

/**
 * @route   POST /media/upload
 * @desc    Upload media (image/video)
 * @access  Private
 */
router.post(
  "/upload",
  authenticate(),
  uploadSingleImage,
  mediaController.uploadMedia
);

/**
 * @route   DELETE /media
 * @desc    Delete media
 * @access  Private
 */
router.delete("/", authenticate(), mediaController.deleteMedia);

/**
 * @route   GET /media/:id
 * @desc    Get media by ID
 * @access  Public
 */
router.get("/:id", mediaController.getMedia);

/**
 * @route   GET /media/post/:postId
 * @desc    Get all media for a post
 * @access  Public
 */
router.get("/post/:postId", mediaController.getPostMedia);

export default router;
