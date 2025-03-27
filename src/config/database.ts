import { DataSource } from "typeorm";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [join(__dirname, "../entities/**/*.{ts,js}")],
  migrations: [join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [join(__dirname, "../subscribers/**/*.{ts,js}")],
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Initialize Database
 */
export const InitializeDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established");

      // Sync schema
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.SYNC_DB === "true"
      ) {
        console.log("Synchronizing database schema");
        await AppDataSource.synchronize();
      }
    }

    return AppDataSource;
  } catch (error) {
    console.error("Error during database connection: ", error);
    throw error;
  }
};

/**
 * Close DB connection
 */
export const closeDB = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  } catch (error) {
    console.error("Error during database disconnection: ", error);
    throw error;
  }
};

/**
 * Check DB connection
 */
export const checkDBConnection = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await InitializeDB();
    }

    // Simple query to check connection
    await AppDataSource.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection check failed: ", error);
    return false;
  }
};
