import { AppDataSource } from "@/config/database";
import { User } from "@/entities/User.entity";
import {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "../validations/auth.schema";
import { Response } from "express";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/utils/errors.utils";
import * as bcrypt from "bcryptjs";
import generateToken, { logout } from "@/utils/generateToken.utils";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Register a new user
   */
  async register(userData: RegisterInput, res: Response) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      const message =
        existingUser.email === userData.email
          ? "Email already in use"
          : "Username already in use";
      throw new ValidationError({ message });
    }

    // Create new user
    const user = new User();
    user.username = userData.username;
    user.email = userData.email;
    user.passwordHash = await bcrypt.hash(userData.password, 10);
    user.fullName = userData.fullName;

    // Save user to database
    await this.userRepository.save(user);

    // Generate token
    const token = generateToken(user.id, res);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Authenticate a user
   */
  async login(credentials: LoginInput, res: Response) {
    // Find user with email or username
    const user = await this.userRepository.findOne({
      where: [
        { email: credentials.emailOrUsername },
        { username: credentials.emailOrUsername },
      ],
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate token
    const token = generateToken(user.id, res);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.toJSON();
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    passwordData: ChangePasswordInput,
    res: Response
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Validate current password
    const isPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new ValidationError({ message: "Current password is incorrect" });
    }

    // Explicitly hash and save new password
    user.passwordHash = await bcrypt.hash(passwordData.newPassword, 10);
    await this.userRepository.save(user);

    // Logout after change password
    logout(res);

    return {
      success: true,
      loggedOut: true,
    };
  }

  /**
   * Log out user
   */
  logoutUser(res: Response) {
    logout(res);
    return { success: true };
  }
}
