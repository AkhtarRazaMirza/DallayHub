/**
 * Role-Based Access Control (RBAC) Middleware
 * Protects endpoints with role-based authorization
 * Works in conjunction with authentication middleware
 */

import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/error.js";

/**
 * Middleware factory to require specific roles
 * Must be used AFTER authentication middleware
 * 
 * Usage:
 * router.delete("/api/admin/users/:id", authenticate, requireRole("admin"), deleteUser);
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    // Get role from request user object
    // This will be added by the updated authentication middleware
    const userRole = (req.user as any).role || "user";

    if (!allowedRoles.includes(userRole)) {
      throw ApiError.forbidden(
        `This action requires one of the following roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
}

/**
 * Convenience middleware - require admin role
 * Shorthand for requireRole("admin")
 */
export const requireAdmin = requireRole("admin");

/**
 * Convenience middleware - require user role
 * Shorthand for requireRole("user")
 */
export const requireUser = requireRole("user");
