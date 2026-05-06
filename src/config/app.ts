import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "../auth/auth.route.js";
import { securityHeaders, setupCORS } from "../middlewares/security.js";
import { rateLimits } from "../middlewares/rateLimiter.js";
import cors from "cors";

/**
 * Express Application Factory
 * Creates and configures the Express app with all middleware and routes
 * 
 * @returns {Application} Configured Express application instance
 */
export function createApp(): Application {
  const app = express();

  // SECURITY MIDDLEWARE

  // Add security headers to all responses
  app.use(securityHeaders);

  // Configure CORS
  setupCORS(app);

  // PARSING MIDDLEWARE

  // Parse incoming JSON request bodies
  app.use(express.json());

  // Parse cookies from incoming requests
  app.use(cookieParser());

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  // HEALTH CHECK (before routes)

  // Simple health check endpoint for monitoring
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "✅ Server is running",
      timestamp: new Date().toISOString()
    });
  });

  // ROUTES

  // Authentication routes (register, login, refresh token, logout, etc.)
  // Rate limiting applied to specific endpoints in auth.route.ts
  app.use("/api/auth", authRouter);

  // TODO: Add Todo routes when ready
  // app.use("/api/todo", todoRouter);

  return app;
}