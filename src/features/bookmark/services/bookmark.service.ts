import { AppDataSource } from "@/config/database";
import { Bookmark } from "@/entities/Bookmark.entity";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import { NotFoundError, ValidationError } from "@/utils/errors.utils";

export class BookmarkService {
  private bookmarkRepository = AppDataSource.getRepository(Bookmark);
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);

  /**
   * Add bookmark
   */
  async addBookmark(userId: string, postId: string) {
    try {
      // Find user
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Find post
      const post = await this.postRepository.findOneBy({ id: postId });
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Check if already bookmarked
      const existingBookmark = await this.bookmarkRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (existingBookmark) {
        throw new ValidationError({ message: "Post already bookmarked" });
      }

      // Create bookmark
      const bookmark = this.bookmarkRepository.create({
        user,
        post,
      });

      await this.bookmarkRepository.save(bookmark);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, postId: string) {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (!bookmark) {
        throw new ValidationError({ message: "Bookmark not found" });
      }

      // Remove bookmark
      await this.bookmarkRepository.remove(bookmark);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bookmark status
   */
  async checkBookmarkStatus(userId: string, postId: string) {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      return { bookmarked: !!bookmark };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get bookmarked posts
   */
  async getBookmarkedPosts(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [bookmarks, total] = await this.bookmarkRepository
        .createQueryBuilder("bookmark")
        .leftJoinAndSelect("bookmark.post", "post")
        .leftJoinAndSelect("post.user", "user")
        .leftJoinAndSelect("post.media", "media")
        .where("bookmark.user.id = :userId", { userId })
        .orderBy("bookmark.createdAt", "DESC")
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const posts = bookmarks.map((bookmark) => bookmark.post);

      return {
        posts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
