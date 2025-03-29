import express from "express";
import { BookmarkController } from "../controllers/bookmark.controller";
import { authenticate } from "@/features/auth";

const router = express.Router();
const bookmarkController = new BookmarkController();

/**
 * @route   POST /bookmarks
 * @desc    Add bookmark
 * @access  Private
 */
router.post("/", authenticate(), bookmarkController.addBookmark);

/**
 * @route   DELETE /bookmarks/:postId
 * @desc    Remove bookmark
 * @access  Private
 */
router.delete("/:postId", authenticate(), bookmarkController.removeBookmark);

/**
 * @route   GET /bookmarks/status/:postId
 * @desc    Check bookmark status
 * @access  Private
 */
router.get(
  "/status/:postId",
  authenticate(),
  bookmarkController.checkBookmarkStatus
);

/**
 * @route   GET /bookmarks
 * @desc    Get user bookmarked posts
 * @access  Private
 */
router.get("/", authenticate(), bookmarkController.getBookmarkedPosts);

export default router;
