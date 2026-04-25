import bcryptjs from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import ApiError from "../utils/error.js";
import { db } from "../config/db.js";
import { usersTable, sessionsTable, emailVerificationTable, passwordResetTable } from "../db/schema.js";
import { eq, lt } from "drizzle-orm";
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
    // const { rawToken } = generateResetToken();
    // await sendVerificationEmail(email, rawToken);
    const { rawToken } = generateResetToken();

    const hashed = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 🔥 DELETE OLD TOKENS FOR THIS USER
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.user_id, user.id));

    // store in DB
    await db.insert(emailVerificationTable).values({
      user_id: user.id,
      token: hashed,
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // send email
    await sendVerificationEmail(email, rawToken);

    // Generate tokens
    // const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    // const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    // const hashedToken = AuthService.hashToken(refreshToken);
    // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // try {
    //   await db.insert(sessionsTable).values({
    //     user_id: user.id,
    //     refresh_token: hashedToken,
    //     expires_at: expiresAt,
    //   });
    // } catch (err) {
    //   throw ApiError.internal("Failed to create session");
    // }

    // return {
    //   accessToken,
    //   refreshToken,
    //   user,
    // };
    return {
      message: "Please verify your email"
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

    if (!user.isVerified) {
      throw ApiError.unauthorized("Please verify your email first");
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const hashedToken = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await db.insert(sessionsTable).values({
      user_id: user.id,
      refresh_token: hashedToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

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
      // 1. verify JWT
      const payload = verifyRefreshToken(refreshToken);

      // 2. hash incoming token
      const hashedToken = createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // 3. find session in DB
      const session = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.refresh_token, hashedToken));

      if (session.length === 0) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      const [currentSession] = session;
      if (!currentSession) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      // 4. check expiry
      if (new Date(currentSession.expires_at) < new Date()) {
        throw ApiError.unauthorized("Refresh token expired");
      }

      // 5. delete old session (rotation)
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.refresh_token, hashedToken));

      // 6. generate new tokens
      const newAccessToken = generateAccessToken({
        userId: payload.userId,
      });

      const newRefreshToken = generateRefreshToken({
        userId: payload.userId,
      });

      // 7. store new session
      const newHashed = createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

      await db.insert(sessionsTable).values({
        user_id: payload.userId,
        refresh_token: newHashed,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
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
    // 1. Find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      throw ApiError.badRequest("User not found");
    }

    const user = users[0]!;

    // 2. Generate RAW token
    const resetToken = randomBytes(32).toString("hex");

    // 3. Hash token (store this in DB)
    const hashedToken = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. Set expiry (15 min)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Delete old tokens (optional cleanup)
    await db
      .delete(passwordResetTable)
      .where(eq(passwordResetTable.user_id, user.id));

    // 6. Store new token
    await db.insert(passwordResetTable).values({
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
    });

    // 🔥 7. IMPORTANT: Send RAW token (not hashed)
    console.log("RESET TOKEN:", resetToken);
    await sendResetPasswordEmail(email, resetToken);

    return {
      message: "Password reset link sent",
      resetToken, // only for testing (remove in production)
    };
  }

  /**
   * Reset password with reset token
   * - Verifies reset token format
   * - Hashes new password
   * - Updates user password in database
   */
  static async resetPassword(token: string, newPassword: string) {
    // 1. Hash incoming token
    const hashed = createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Remove expired tokens
    await db
      .delete(passwordResetTable)
      .where(lt(passwordResetTable.expires_at, new Date()));

    // 3. Find matching token
    const records = await db
      .select()
      .from(passwordResetTable)
      .where(eq(passwordResetTable.token, hashed));

    if (records.length === 0) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    const record = records[0]!;

    // 4. Double-check expiry
    if (new Date(record.expires_at) < new Date()) {
      throw ApiError.badRequest("Token expired");
    }

    // 5. Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // 6. Update user password
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, record.user_id));

    // 7. Delete token (one-time use)
    await db
      .delete(passwordResetTable)
      .where(eq(passwordResetTable.token, hashed));

    return { message: "Password reset successfully" };
  }

  /**
   * Verify user email with verification token
   * - Verifies token format
   * - Updates user isVerified status in database
   */
  // static async verifyEmail(token: string) {
  //   try {
  //     // TODO: Implement token validation from database
  //     // For now, just validate format and proceed
  //     if (!token || token.trim().length === 0) {
  //       throw ApiError.badRequest("Invalid or expired verification token");
  //     }

  //     // TODO: Find user by verification token and update isVerified=true

  //     return { message: "Email verified successfully" };
  //   } catch (error) {
  //     throw ApiError.badRequest("Invalid or expired verification token");
  //   }
  // }
  private static hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  static async verifyEmail(token: string) {
    // 🔥 hash incoming token
    console.log("TOKEN RECEIVED:", token);

    const hashed = createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("HASHED TOKEN:", hashed);

    const record = await db
      .select()
      .from(emailVerificationTable)
      .where(eq(emailVerificationTable.token, hashed));

    console.log("DB RECORD:", record);

    if (record.length === 0) {
      throw ApiError.badRequest("Invalid token");
    }

    const data = record[0]!;

    // 2. Check expiry
    if (data.expires_at < new Date()) {
      throw ApiError.badRequest("Token expired");
    }

    // 3. Update user
    await db
      .update(usersTable)
      .set({ isVerified: true })
      .where(eq(usersTable.id, data.user_id));

    // 4. Delete token
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.id, data.id));

    return { message: "Email verified successfully" };
  }



  static async logout(refreshToken: string) {
    const hashed = AuthService.hashToken(refreshToken);

    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.refresh_token, hashed));
  }
}