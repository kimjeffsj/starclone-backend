import { AppDataSource } from "@/config/database";
import { User } from "@/entities/User.entity";
import { UnauthorizedError } from "@/utils/errors.utils";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

/**
 * Authentication middleware
 *  - Check JWT token in Authorization header
 *  - Assign user to req.user
 */
export const authenticate = () => {
  const userRepository = AppDataSource.getRepository(User);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      // Check for token in cookies first
      if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
      }
      // Fallback to Authorization header
      else if (
        req.headers.authorization &&
        req.headers.authorization?.startsWith("Bearer")
      ) {
        token = req.headers.authorization?.split(" ")[1];
      }

      if (!token) {
        throw new UnauthorizedError("Authentication required");
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string };

        // Query user
        const user = await userRepository.findOneBy({ id: decoded.userId });

        if (!user) {
          throw new UnauthorizedError("User not found");
        }

        // Set user and token request
        req.user = user;
        req.token = token;

        next();
      } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
      }
    } catch (error) {
      next(error);
    }
  };
};
