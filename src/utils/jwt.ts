import crypto from "crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../env.js";

/**
 * JWT Token Payload Interface
 * Contains user identification data embedded in tokens
 */
interface TokenPayload extends JwtPayload {
  userId: string;
  email?: string;
}

// ACCESS TOKEN (Short-lived, for API requests)

/**
 * Generates a short-lived access token (default: 15 minutes)
 * Used for authenticating API requests
 * 
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: any = {};
  if (env.JWT_ACCESS_EXPIRES_IN) {
    // expiresIn accepts string format like "15m", "1h", "7d"
    options.expiresIn = env.JWT_ACCESS_EXPIRES_IN;
  }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

/**
 * Verifies and decodes an access token
 * Throws error if token is invalid, expired, or has wrong signature
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload with user data
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

// REFRESH TOKEN (Long-lived, for token renewal)

/**
 * Generates a long-lived refresh token (default: 7 days)
 * Used to obtain new access tokens without re-authenticating
 * Stored securely in httpOnly cookies
 * 
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: any = {};
  if (env.JWT_REFRESH_EXPIRES_IN) {
    // expiresIn accepts string format like "15m", "1h", "7d"
    options.expiresIn = env.JWT_REFRESH_EXPIRES_IN;
  }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

/**
 * Verifies and decodes a refresh token
 * Throws error if token is invalid or expired
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload with user data
 * @throws Error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

// PASSWORD RESET TOKEN (One-time use, expires)

/**
 * Generates a one-time password reset token
 * Returns both raw token (for email link) and hashed version (for database storage)
 * 
 * Process:
 * 1. Generate random 32-byte string as raw token
 * 2. Hash it with SHA-256 for database storage
 * 3. Send raw token to user via email
 * 4. Compare user's token against hashed version stored in DB
 * 
 * @returns Object with raw token (for user) and hashed token (for database)
 */
export const generateResetToken = (): {
  rawToken: string;
  hashedToken: string;
} => {
  // Generate cryptographically secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash the token for secure storage in database
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};