import express from "express";
import { FollowController } from "../controllers/follow.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const followController = new FollowController();

/**
 * @route   POST /follows
 * @desc    Follow a user
 * @access  Private
 */
router.post("/", authenticate(), followController.followUser);

/**
 * @route   DELETE /follows/:username
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete("/:username", authenticate(), followController.unfollowUser);

/**
 * @route   GET /follows/status/:username
 * @desc    Check follow status
 * @access  Private
 */
router.get(
  "/status/:username",
  authenticate(),
  followController.checkFollowStatus
);

/**
 * @route   GET /follows/followers/:username
 * @desc    Get followers of a user
 * @access  Public
 */
router.get("/followers/:username", followController.getFollowers);

/**
 * @route   GET /follows/following/:username
 * @desc    Get users that a user is following
 * @access  Public
 */
router.get("/following/:username", followController.getFollowing);

/**
 * @route   GET /follows/counts/:username
 * @desc    Get follow counts
 * @access  Public
 */
router.get("/counts/:username", followController.getFollowCounts);

export default router;
