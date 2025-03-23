import express from "express";
import { LikeController } from "../controllers/like.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const likeController = new LikeController();

/**
 * @route   POST /likes
 * @desc    Like post
 * @access  Private
 */
router.post("/", authenticate(), likeController.likePost);

/**
 * @route   DELETE /likes/:postId
 * @desc    Unlike post
 * @access  Private
 */
router.delete("/:postId", authenticate(), likeController.unlikePost);

/**
 * @route   GET /likes/status/:postId
 * @desc    Check like status
 * @access  Private
 */
router.get("/status/:postId", authenticate(), likeController.checkLikeStatus);

/**
 * @route   GET /likes/post/:postId
 * @desc    Get liked list
 * @access  Public
 */
router.get("/post/:postId", likeController.getPostLikes);

export default router;
