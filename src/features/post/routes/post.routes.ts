import express from "express";
import { PostController } from "../controller/post.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const postController = new PostController();

/**
 * @route   POST /posts
 * @desc    Create a new post
 * @access  Private
 */
router.post("/", authenticate(), postController.createPost);

/**
 * @route   GET /posts
 * @desc    Get posts (feed or by user)
 * @access  Private
 */
router.get("/", authenticate(), postController.getPosts);

/**
 * @route   GET /posts/:id
 * @desc    Get post by ID
 * @access  Private
 */
router.get("/:id", authenticate(), postController.getPostById);

/**
 * @route   POST /posts/:id
 * @desc    Update post
 * @access  Private
 */
router.post("/:id", authenticate(), postController.updatePost);

/**
 * @route   DELETE /posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete("/:id", authenticate(), postController.deletePost);

/**
 * @route   PUT /posts/:id/media-order
 * @desc    Update media order in post
 * @access  Private
 */
router.put("/:id/media-order", authenticate(), postController.updateMediaOrder);

export default router;
