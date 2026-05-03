import "dotenv/config";
import { createApp } from "./config/app.js";
import http from "node:http";
import { env } from "./env.js";
import { db } from "./config/db.js";
import { usersTable, sessionsTable, emailVerificationTable, passwordResetTable } from "./db/schema.js";

/**
 * Application Entry Point
 * Initializes Express server and database connection
 * Sets up HTTP listener on configured PORT
 */

try {
  // Create Express app with configured routes and middleware
  const app = createApp();
  
  // Create HTTP server instance
  const server = http.createServer(app);
  
  // Get port from environment variables (defaults to 8080)
  const PORT = parseInt(env.PORT);
  
  // Start listening for incoming requests
  server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
  
  // Test database connectivity
  try {
    await db.execute("SELECT 1");
    console.log("Database client initialized successfully");

  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }


  // Note: Drizzle ORM connection is lazy, actual connection happens on first query
} catch (error) {
  // Log error and terminate process if server fails to start
  console.error(" Server failed to start:", error);
  process.exit(1);
}