import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "reflect-metadata";

import dotenv from "dotenv";

import { InitializeDB } from "./config/database";

// Routers
import { authRouter } from "./features/auth";
import { postRouter } from "./features/posts";

dotenv.config();

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Connect db
InitializeDB()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// Routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

// Base routes
app.get("/", (req, res) => {
  res.send("Instagram Clone API is running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
