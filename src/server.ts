import connectDB from "./config/database";
import app from "./app";
import dotenv from "dotenv";
import logger from "./logger/logger";

dotenv.config();

// Start server and database connection
const startServer = async () => {
  try {
    // Attempt to connect to database
    await connectDB();

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    logger.error(
      "Please check:\n" +
        "1. MongoDB connection string in .env file\n" +
        "2. Your IP is whitelisted in MongoDB Atlas\n" +
        "3. MongoDB credentials are correct"
    );
    // Don't exit immediately - let the server start anyway for development
    // In production, you might want to exit here
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.warn(
        `Server started on port ${port} but database connection failed`
      );
    });
  }
};

startServer();
