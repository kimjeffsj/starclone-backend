import express from "express";
import cors from "cors";
import helmet from "helmet";
import "reflect-metadata";
import { AppDataSource } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect db
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Instagram Clone API is running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
