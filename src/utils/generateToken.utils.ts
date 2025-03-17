import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // ms (15 days)
    httpOnly: true, // prevent XSS cross site scripting
    sameSite: "strict", // CSRF attack cross-site request forgery
    secure: process.env.NODE_ENV !== "development", // HTTPS
  });

  return token;
};

export const logout = (res: Response): void => {
  res.cookie("jwt", "", {
    httpOnly: true,
    maxAge: 0,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    expires: new Date(0),
  });
};

export default generateToken;
