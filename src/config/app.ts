import express from "express";
import type { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "../auth/auth.route.js";

import { securityHeaders } from "../middlewares/security.js";

export function createApp(): Application {
  const app = express();

  // SECURITY HEADERS
  app.use(securityHeaders);

  // CORS
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  // JSON PARSER
  app.use(express.json());

  // COOKIE PARSER
  app.use(cookieParser());

  // HEALTH CHECK
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "✅ Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // AUTH ROUTES
  app.use("/api/auth", authRouter);

  return app;
}