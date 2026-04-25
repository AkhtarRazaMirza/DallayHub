import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import ApiResponse from "../utils/success.js";
import ApiError from "../utils/error.js";
import e from "express";
/**
 * Register new user with email, password, first name, and last name
 * - Validates input using RegisterDto
 * - Creates user in database with hashed password
 * - Sends verification email
 * - Returns access token and refresh token (in httpOnly cookie)
 */
export const register = async (req: Request, res: Response) => {
  try {
    const data = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
    const result = await AuthService.registerUser(data);

    // res.cookie("refreshToken", result.refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    // return ApiResponse.created(res, "User registered successfully", {
    //   // accessToken: result.accessToken,
    //   // user: result.user,
    // });
    return ApiResponse.created(res, "Please verify your email", {});
  } catch (error) {
    throw error
  }
};

/**
 * Login user with email and password
 * - Validates credentials
 * - Returns access token and refresh token (in httpOnly cookie)
 */
export const login = async (req: Request, res: Response) => {
  try {
    const data = req.body as {
      email: string;
      password: string;
    };
    const result = await AuthService.loginUser(data);
    if (!result.user.isVerified) {
      throw ApiError.unauthorized("Please verify your email first");
    }

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.ok(res, "Login successful", {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    throw error
  }
};

/**
 * Refresh access token using refresh token from cookie
 * - Validates refresh token from cookie or body
 * - Returns new access token
 */
export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      throw ApiError.unauthorized("No refresh token provided");
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return ApiResponse.ok(res, "Token refreshed", {
      accessToken: result.accessToken,
    });
  } catch (error) {
    throw error
  }
};

/**
 * Logout user by clearing refresh token cookie
 * - Clears httpOnly refreshToken cookie
 * - Returns success message
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.clearCookie("refreshToken");
    return ApiResponse.ok(res, "Logged out successfully", {});
  } catch (error) {
    throw error
  }
};

/**
 * Get current authenticated user's profile
 * - Requires authentication middleware
 * - Returns user data from database
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const user = await AuthService.getCurrentUser(req.user.id);

    return ApiResponse.ok(res, "User fetched successfully", user);
  } catch (error) {
    throw error
  }
};

/**
 * Request password reset email
 * - Validates email exists in database
 * - Generates reset token
 * - Sends reset email to user
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const data = req.body as {
      email: string;
    };
    const result = await AuthService.requestPasswordReset(data.email);

    return ApiResponse.ok(res, result.message, {});
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with reset token
 * - Validates reset token
 * - Hashes new password
 * - Updates user password in database
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const data = req.body as {
      newPassword: string;
    };

    if (!token || Array.isArray(token)) {
      throw ApiError.badRequest("Invalid reset token");
    }

    const result = await AuthService.resetPassword(token, data.newPassword);

    return ApiResponse.ok(res, result.message, {});
  } catch (error) {
    throw error;
  }
};

/**
 * Verify user email with verification token
 * - Validates verification token from URL
 * - Updates user isVerified status in database
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token || Array.isArray(token)) {
      throw ApiError.badRequest("Invalid verification token");
    }

    const result = await AuthService.verifyEmail(token);

    return ApiResponse.ok(res, result.message, {});
  } catch (error) {
    throw error;
  }
};

