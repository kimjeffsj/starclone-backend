import { AppDataSource } from "@/config/database";
import { Follow } from "@/entities/Follow.entity";
import { User } from "@/entities/User.entity";
import { ForbiddenError, NotFoundError } from "@/utils/errors.utils";

export class FollowService {
  private followRepository = AppDataSource.getRepository(Follow);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Follow user
   */
  async followUser(followerUserId: string, usernameToFollow: string) {
    // Find follower
    const follower = await this.userRepository.findOneBy({
      id: followerUserId,
    });
    if (!follower) {
      throw new NotFoundError("User not found");
    }

    // Find user to follow
    const userToFollow = await this.userRepository.findOneBy({
      username: usernameToFollow,
    });
    if (!userToFollow) {
      throw new NotFoundError("User to follow not found");
    }

    // Cannot follow yourself
    if (follower.id === userToFollow.id) {
      throw new ForbiddenError("You cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await this.followRepository.findOne({
      where: {
        follower: { id: followerUserId },
        following: { id: userToFollow.id },
      },
    });

    if (existingFollow) {
      throw new ForbiddenError("You are already following this user");
    }

    // Create follow relation
    const follow = this.followRepository.create({
      follower,
      following: userToFollow,
    });

    await this.followRepository.save(follow);

    return { success: true };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerUserId: string, usernameToUnfollow: string) {
    // Find user to unfollow
    const userToUnfollow = await this.userRepository.findOneBy({
      username: usernameToUnfollow,
    });
    if (!userToUnfollow) {
      throw new NotFoundError("User to unfollow not found");
    }

    // Check if following
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerUserId },
        following: { id: userToUnfollow.id },
      },
    });

    if (!follow) {
      throw new ForbiddenError("You are not following this user");
    }

    // Remove follow relationship
    await this.followRepository.remove(follow);

    return { success: true };
  }

  /**
   * Check if one user follows another
   */
  async checkFollowStatus(followerUserId: string, usernameToCheck: string) {
    const userToCheck = await this.userRepository.findOneBy({
      username: usernameToCheck,
    });
    if (!userToCheck) {
      throw new NotFoundError("User not found");
    }

    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerUserId },
        following: { id: userToCheck.id },
      },
    });

    return { following: !!follow };
  }

  /**
   * Get followers of a user
   */
  async getFollowers(username: string, page = 1, limit = 20) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.follower", "follower")
      .where("follow.following.id = :userId", { userId: user.id })
      .skip(skip)
      .take(limit)
      .orderBy("follow.createdAt", "DESC")
      .getManyAndCount();

    // Extract follower users only
    const followers = follows.map((follow) => follow.follower);

    return {
      followers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(username: string, page = 1, limit = 20) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.following", "following")
      .where("follow.follower.id = :userId", { userId: user.id })
      .skip(skip)
      .take(limit)
      .orderBy("follow.createdAt", "DESC")
      .getManyAndCount();

    // Extract following users only
    const following = follows.map((follow) => follow.following);

    return {
      following,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get follower/following counts
   */
  async getFollowCounts(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const followersCount = await this.followRepository.count({
      where: { following: { id: user.id } },
    });

    const followingCount = await this.followRepository.count({
      where: { follower: { id: user.id } },
    });

    return {
      username,
      followersCount,
      followingCount,
    };
  }
}
