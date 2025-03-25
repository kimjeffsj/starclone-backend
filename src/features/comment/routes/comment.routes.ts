import express from "express";
import { CommentController } from "../controllers/comment.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const commentController = new CommentController();

/**
 * @route   POST /comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post("/", authenticate(), commentController.createComment);

/**
 * @route   GET /comments/post/:postId
 * @desc    Get comments for a post
 * @access  Public
 */
router.get("/post/:postId", commentController.getCommentsByPost);

/**
 * @route   PUT /comments/:id
 * @desc    Update a comment
 * @access  Private
 */
router.put("/:id", authenticate(), commentController.updateComment);

/**
 * @route   DELETE /comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete("/:id", authenticate(), commentController.deleteComment);

export default router;
