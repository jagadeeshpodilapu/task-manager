import mongoose from "mongoose";
import logger from "../logger/logger";

// Set up connection event handlers before connecting
mongoose.connection.on("error", (error: Error) => {
  logger.error("MongoDB connection error:", error);
});

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected successfully");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected successfully");
});

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_DB_URL;

  if (!mongoUrl) {
    logger.error("MONGO_DB_URL environment variable is not set");
    throw new Error("MONGO_DB_URL is required");
  }

  // Connection options for better reliability
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    retryWrites: true,
  };

  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(mongoUrl, options);
      logger.info(`Connected to MongoDB: ${conn.connection.host}`);
      return;
    } catch (error) {
      lastError = error as Error;
      retries--;

      if (retries > 0) {
        logger.warn(
          `MongoDB connection failed. Retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before retry
      } else {
        logger.error("Failed to connect to MongoDB after multiple attempts");
        logger.error(
          "Common issues:\n" +
            "1. IP address not whitelisted in MongoDB Atlas\n" +
            "2. Incorrect username/password\n" +
            "3. Network connectivity issues\n" +
            "4. MongoDB Atlas cluster is down\n\n" +
            "To whitelist your IP: https://www.mongodb.com/docs/atlas/security-whitelist/"
        );
        throw lastError;
      }
    }
  }
};

export default connectDB;
