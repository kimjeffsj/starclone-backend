import { NextFunction, Request, Response } from "express";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../validations/auth.schema";
import { UnauthorizedError, ValidationError } from "@/utils/errors.utils";
import { authService } from "..";

export class AuthController {
  // Sign Up
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Request validation
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const result = await authService.register(validationResult.data, res);

      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
        token: result.token,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Request Validation
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      const result = await authService.login(validationResult.data, res);

      res.status(200).json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  // Query current user
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const user = await authService.getUserById(req.user.id);

      res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request
      const validationResult = changePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.format());
      }

      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Not Authenticated");
      }

      await authService.changePassword(req.user.id, validationResult.data, res);

      res.status(200).json({
        message:
          "Password changed successfully. Please log in again with your new password.",
        loggedOut: true,
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Delete cookie
      authService.logoutUser(res);

      res.status(200).json({
        message: "Logged out successfully",
      });
      return;
    } catch (error) {
      next(error);
    }
  };
}
