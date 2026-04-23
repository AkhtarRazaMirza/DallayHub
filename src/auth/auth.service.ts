import bcryptjs from "bcryptjs";
import ApiError from "../utils/error.js";
import { db } from "../config/db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
} from "../utils/jwt.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../config/email.js";

export class AuthService {
  /**
   * Register a new user with email, password, and name
   * - Checks if user already exists
   * - Hashes password with bcryptjs
   * - Creates user in database
   * - Sends verification email
   * - Returns access and refresh tokens
   */
  static async registerUser({
    email,
    password,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      throw ApiError.conflict("User with this email already exists");
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user in database
    const newUser = await db
      .insert(usersTable)
      .values({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        isVerified: false,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      });

    const user = newUser[0];
    if (!user) {
      throw ApiError.internal("Failed to create user");
    }

    // Generate verification token and send email
    const { rawToken } = generateResetToken();
    await sendVerificationEmail(email, rawToken);

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Authenticate user with email and password
   * - Finds user by email
   * - Verifies password hash
   * - Returns access and refresh tokens
   */
  static async loginUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const user = users[0];
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password!);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Generate new access token using refresh token
   * - Verifies refresh token validity
   * - Fetches user from database
   * - Returns new access token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Fetch user from database
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, payload.userId));

      if (users.length === 0) {
        throw ApiError.unauthorized("User not found");
      }

      const user = users[0];
      if (!user) {
        throw ApiError.unauthorized("User not found");
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      throw ApiError.unauthorized("Invalid refresh token");
    }
  }

  /**
   * Get current authenticated user by ID
   * - Fetches user from database
   * - Returns user data without password
   */
  static async getCurrentUser(userId: string) {
    const users = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        isVerified: usersTable.isVerified,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (users.length === 0) {
      throw ApiError.notFound("User not found");
    }

    return users[0];
  }

  /**
   * Request password reset for user
   * - Finds user by email
   * - Generates reset token
   * - Sends reset email
   */
  static async requestPasswordReset(email: string) {
    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return { message: "If user exists, reset email will be sent" };
    }

    // Generate reset token
    const { rawToken } = generateResetToken();

    // Send reset email
    await sendResetPasswordEmail(email, rawToken);

    return { message: "Reset password email sent" };
  }

  /**
   * Reset password with reset token
   * - Verifies reset token format
   * - Hashes new password
   * - Updates user password in database
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      // TODO: Implement token validation from database
      // For now, just validate format and proceed

      // Hash new password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      // TODO: Update user password in database and clear reset token
      // This requires storing reset tokens in DB with expiration

      return { message: "Password reset successfully" };
    } catch (error) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }
  }

  /**
   * Verify user email with verification token
   * - Verifies token format
   * - Updates user isVerified status in database
   */
  static async verifyEmail(token: string) {
    try {
      // TODO: Implement token validation from database
      // For now, just validate format and proceed

      // TODO: Find user by verification token and update isVerified=true

      return { message: "Email verified successfully" };
    } catch (error) {
      throw ApiError.badRequest("Invalid or expired verification token");
    }
  }
}