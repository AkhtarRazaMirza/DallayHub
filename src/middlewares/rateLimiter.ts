/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for protecting auth endpoints
 * Tracks requests per IP address
 * 
 * No external dependencies - safe and lightweight
 */

import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/error.js";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

/**
 * Create a rate limiting middleware
 * @param windowMs - Time window in milliseconds (e.g., 15 * 60 * 1000 = 15 minutes)
 * @param maxRequests - Maximum requests per window
 * @returns Express middleware function
 */
export function createRateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 5
) {
  const store: RateLimitStore = {};

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.ip || req.socket.remoteAddress) as string;
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[ip].count++;

    // Set retry-after header
    const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);
    res.set("Retry-After", retryAfter.toString());

    // Check if limit exceeded
    if (store[ip].count > maxRequests) {
      throw ApiError.tooManyRequests(
        `Too many requests. Please try again after ${retryAfter} seconds.`
      );
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimits = {
  // Strict limit for auth operations (login, register, password reset)
  auth: createRateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes

  // Medium limit for password operations
  password: createRateLimiter(30 * 60 * 1000, 3), // 3 requests per 30 minutes

  // Global API limit (if needed)
  api: createRateLimiter(60 * 1000, 100), // 100 requests per minute
};
