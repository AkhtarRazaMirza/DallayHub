import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "../auth/auth.route.js";

/**
 * Express Application Factory
 * Creates and configures the Express app with all middleware and routes
 * 
 * @returns {Application} Configured Express application instance
 */
export function createApp(): Application {
  const app = express();
  
  // MIDDLEWARE
  
  // Parse incoming JSON request bodies
  app.use(express.json());
  
  // Parse cookies from incoming requests
  app.use(cookieParser());
  
  // ROUTES
  
  // Authentication routes (register, login, refresh token, logout, etc.)
  app.use("/api/auth", authRouter);
  
  // TODO: Add Todo routes when ready
  // app.use("/api/todo", todoRouter);
  
  // HEALTH CHECK
  
  // Simple health check endpoint for monitoring
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "✅ Server is running" });
  });
  
  return app;
}