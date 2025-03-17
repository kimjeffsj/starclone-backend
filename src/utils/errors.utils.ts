// Validation Error
export class ValidationError extends Error {
  statusCode = 400;
  errors: any;

  constructor(errors: any) {
    super("Validation Error");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

// Unauthorized Error
export class UnauthorizedError extends Error {
  statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// Forbidden Error
export class ForbiddenError extends Error {
  statusCode = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Not Found Error
export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message = "Not Found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// error handling middleware
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  if (err instanceof ValidationError) {
    return res.status(statusCode).json({
      message,
      errors,
    });
  }

  // TypeORM Error handling
  if (err.name === "QueryFailedError" && err.code === "23505") {
    statusCode = 400;
    message = "Duplicate entry";
  }

  // Include stack trace in development environment, exclude in production
  const response: any = {
    message,
    success: false,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
