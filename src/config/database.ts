import { DataSource } from "typeorm";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "instagram_clone",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [join(__dirname, "../entities/**/*.{ts,js}")],
  migrations: [join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [join(__dirname, "../subscribers/**/*.{ts,js}")],
});
