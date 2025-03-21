import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { ValidationError } from "./errors.utils";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "";

/**
 * Upload image to S3
 */

export const uploadImage = async (
  file: Express.Multer.File,
  resizeOptions?: { width?: number; height?: number; quality?: number }
): Promise<{ mediaUrl: string; width: number; height: number }> => {
  // Check media type
  if (!file.mimetype.startsWith("image/")) {
    throw new ValidationError({ message: "Only image file can be uploaded" });
  }

  // Create unique file name
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `uploads/${uuidv4()}.${fileExtension}`;

  // Process image
  let imageBuffer = file.buffer;
  let metadata;

  // Resize, optimization
  if (resizeOptions) {
    const sharpImage = sharp(file.buffer);
    metadata = await sharpImage.metadata();

    const resizeConfig: sharp.ResizeOptions = {};
    if (resizeOptions.width) resizeConfig.width = resizeOptions.width;
    if (resizeOptions.height) resizeConfig.height = resizeOptions.height;

    imageBuffer = await sharpImage
      .resize(resizeConfig)
      .webp({ quality: resizeOptions.quality || 80 })
      .toBuffer();
  } else {
    metadata = await sharp(file.buffer).metadata();
  }

  // Upload to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: imageBuffer,
    contentType: file.mimetype,
  };

  const command = new PutObjectCommand(uploadParams);

  try {
    await s3Client.send(command);
  } catch (error: any) {
    console.error("S3 upload error: ", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Completed Url
  const mediaUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

  return {
    mediaUrl,
    width: metadata?.width || 0,
    height: metadata?.height || 0,
  };
};

export const deleteMedia = async (fileUrl: string): Promise<void> => {
  const key = fileUrl.split(".com/")[1];

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new DeleteObjectCommand(deleteParams);
  try {
    await s3Client.send(command);
  } catch (error: any) {
    console.error("S3 delete error: ", error);
    throw new Error(`Failed to delete the media ${error.message}`);
  }
};
