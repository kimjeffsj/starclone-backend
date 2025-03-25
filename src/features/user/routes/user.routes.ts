import express from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const userController = new UserController();

/**
 * @route   GET /users/:username
 * @desc    Get user profile by username
 * @access  Public
 */
router.get("/:username", userController.getUserProfile);

/**
 * @route   PUT /users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticate(), userController.updateProfile);

/**
 * @route   GET /users/:username/posts
 * @desc    Get posts by username
 * @access  Public
 */
router.get("/:username/posts", userController.getUserPosts);

/**
 * @route   GET /users/search
 * @desc    Search users
 * @access  Public
 */
router.get("/search", userController.searchUsers);

export default router;
