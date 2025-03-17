import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();
const authController = new AuthController();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
router.post("/logout", authController.logout);

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get("/me", authenticate(), authController.me);

/**
 * @route   POST /auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post("/change-password", authenticate(), authController.changePassword);

export default router;
