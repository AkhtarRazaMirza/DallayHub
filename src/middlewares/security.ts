/**
 * Security Middleware
 * Adds security headers and CORS configuration
 * Lightweight alternative to Helmet for basic protection
 */

import type { Application, Request, Response, NextFunction } from "express";

/**
 * Add security headers to all responses
 * Protects against common web vulnerabilities
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS protection (browser-level)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent referrer information leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable caching for sensitive pages
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  next();
}

/**
 * Configure CORS for the application
 * @param app - Express application instance
 * @param allowedOrigins - Array of allowed origins (default: localhost for development)
 */

/**
 * Secure cookie configuration
 * Use this when setting cookies (already in auth controller)
 */
export const secureCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
