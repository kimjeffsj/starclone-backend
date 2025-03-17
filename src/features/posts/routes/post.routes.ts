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

export default router;
