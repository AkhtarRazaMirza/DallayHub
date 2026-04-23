import ApiError from "../utils/error.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { db } from "../config/db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

/**
 * User object type for authenticated requests
 * Attached to req.user after successful authentication
 */
interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | undefined;
}

/**
 * Extend Express Request type to include authenticated user
 * Allows TypeScript to recognize req.user in route handlers
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT access token from Authorization header or cookies
 * Fetches user from database and attaches to req.user
 * Throws 401 Unauthorized if token is missing or invalid
 * 
 * Usage: app.get("/api/protected", authenticate, handler);
 * 
 * Token can be provided via:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookies: httpOnly cookie named 'accessToken'
 */
const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Extract token from Authorization header (Bearer scheme)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    // Fallback: Try to get token from cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // No token found - user is not authenticated
    if (!token) {
      throw ApiError.unauthorized("No authentication token provided");
    }

    // Verify token signature and expiration
    const decoded = verifyAccessToken(token);

    // Fetch user from database using Drizzle ORM
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    const user = users[0];

    // User no longer exists (deleted account)
    if (!user) {
      throw ApiError.unauthorized("User account not found");
    }

    // Attach authenticated user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName || undefined,
    };

    // Proceed to next middleware/handler
    next();
  } catch (error) {
    // If token verification fails, throw 401 error
    if (error instanceof Error && error.message.includes("jwt")) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
    throw error;
  }
};

/**
 * Authorization Middleware (Role-based Access Control)
 * Checks if authenticated user has required role
 * Higher-order function that returns middleware with specific roles
 * 
 * Usage:
 * router.delete("/users/:id", authenticate, authorize("admin"), deleteUser);
 * 
 * @param roles - One or more allowed roles
 * @returns Express middleware function
 * @throws 403 Forbidden if user role not in allowed list
 */
const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Ensure user is authenticated first
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    // TODO: Add role field to users table and schema when implementing role-based access
    // For now, this middleware is prepared but role checking is commented
    // if (!roles.includes(req.user.role)) {
    //   throw ApiError.forbidden(
    //     "You do not have permission to perform this action"
    //   );
    // }

    next();
  };
};

export { authenticate, authorize, type AuthenticatedUser };
