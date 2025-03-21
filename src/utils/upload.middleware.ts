import { Request } from "express";
import multer from "multer";
import { ValidationError } from "./errors.utils";

// Allowed Mime types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Max file size
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Store in memory before upload
const storage = multer.memoryStorage();

// Filter files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // if allowed allow upload
    cb(null, true);
  } else {
    cb(
      new ValidationError({
        message: `Unsupported file type. Allowed types: ${ALLOWED_MIME_TYPES.join(
          ", "
        )}`,
      })
    );
  }
};

// Multer setting
const multerConfig = {
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
};

// Single image upload middleware
export const uploadSingleImage = multer(multerConfig).single("image");

// Multiple image upload middleware
export const uploadMultipleImages = multer(multerConfig).array("images", 10);

// Post image middleware
export const uploadPostImages = multer(multerConfig).array("media", 10);

export const handleMulterErrors = (
  err: any,
  req: Request,
  res: Response,
  next: Function
) => {
  if (err instanceof multer.MulterError) {
    // Multer related error handling
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ValidationError({
          message: `File too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        })
      );
    }
    return next(new ValidationError({ message: err.message }));
  }

  next(err);
};
