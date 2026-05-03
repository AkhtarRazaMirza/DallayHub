import { Router } from "express";
import {
  register,
  login,
  refreshTokenHandler,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleAuth,
  googleCallback
} from "./auth.controler.js";
import validate from "../middlewares/validated.js";
import RegisterDto from "./dto/regestor.js";
import LoginDto from "./dto/login.js";
import ForgotPasswordDto from "./dto/forgot-password.js";
import ResetPasswordDto from "./dto/reset-password.js";
import { authenticate } from "./middleware.js";
import { rateLimits } from "../middlewares/rateLimiter.js";

const router = Router();

/**
 * POST /auth/register
 * Register a new user with email, password, firstName, lastName
 * Returns access token and refresh token (httpOnly cookie)
 * Rate Limited: 5 requests per 15 minutes
 */
router.post("/register", rateLimits.auth, validate(RegisterDto), register);

/**
 * POST /auth/login
 * Authenticate user with email and password
 * Returns access token and refresh token (httpOnly cookie)
 * Rate Limited: 5 requests per 15 minutes
 */
router.post("/login", rateLimits.auth, validate(LoginDto), login);

/**
 * POST /auth/refresh-token
 * Generate new access token using refresh token from cookie
 * Returns new access token
 */
router.post("/refresh-token", refreshTokenHandler);

/**
 * POST /auth/logout
 * Clear refresh token cookie
 */
router.post("/logout", authenticate, logout);

/**
 * GET /auth/me
 * Get current authenticated user's profile
 * Requires authentication middleware
 */
router.get("/me", authenticate, getCurrentUser);

/**
 * POST /auth/forgot-password
 * Request password reset email
 * Sends reset link to user's email
 * Rate Limited: 3 requests per 30 minutes
 */
router.post("/forgot-password", rateLimits.password, validate(ForgotPasswordDto), forgotPassword);

/**
 * PUT /auth/reset-password/:token
 * Reset user password with reset token
 * Token comes from email link sent by forgot-password endpoint
 * Rate Limited: 3 requests per 30 minutes
 */
router.put("/reset-password/:token", rateLimits.password, validate(ResetPasswordDto), resetPassword);

/**
 * GET /auth/verify-email/:token
 * Verify user email with verification token
 * Token comes from verification email sent during registration
 */
router.get("/verify-email/:token", verifyEmail);

// oAuth routes (Google, GitHub, etc.) would go here,
router.get("/google", googleAuth);

router.get("/google/callback", googleCallback);

export default router;