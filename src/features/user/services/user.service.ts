import { AppDataSource } from "@/config/database";
import { User } from "@/entities/User.entity";
import { Post } from "@/entities/Post.entity";
import { NotFoundError } from "@/utils/errors.utils";
import { UpdateProfileInput } from "../validations/user.schema";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    profileData: UpdateProfileInput
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update user properties
    if (profileData.fullName !== undefined) {
      user.fullName = profileData.fullName;
    }

    // TODO: No idea why its giving me error
    if (profileData.bio !== undefined) {
      user.bio = profileData.bio as string;
    }

    if (profileData.website !== undefined) {
      user.website = profileData.website as string;
    }

    // Save updated user
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Get user posts by username
   */
  async getUserPosts(username: string, page = 1, limit = 10) {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.media", "media")
      .where("user.id = :userId", { userId: user.id })
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      totalPages,
    };
  }

  /**
   * Search users by username or fullName
   */
  async searchUsers(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder("user")
      .where("user.username LIKE :query OR user.fullName LIKE :query", {
        query: `%${query}%`,
      })
      .orderBy("user.username", "ASC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    // Return safe user objects (without password hash)
    const safeUsers = users.map((user) => user.toJSON());

    return {
      users: safeUsers,
      total,
      totalPages,
    };
  }
}
