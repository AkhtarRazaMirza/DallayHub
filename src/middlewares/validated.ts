import ApiError from "../utils/error.js";
import type { Request, Response, NextFunction } from "express";
import { BaseDto } from "../utils/base.dto.js";

/**
 * Request Body Validation Middleware
 * Validates incoming request body against a DTO schema
 * Stops execution and returns 400 error if validation fails
 * 
 * Usage in routes:
 * router.post("/register", validate(RegisterDto), registerHandler);
 * 
 * @param DtoClass - DTO class with static schema property
 * @returns Express middleware function
 */
const validate = (DtoClass: typeof BaseDto) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate request body against schema
    const { errors, value } = DtoClass.validate(req.body);
    
    // If validation fails, throw 400 Bad Request error
    if (errors) {
      throw ApiError.badRequest(errors.join("; "));
    }
    
    // Replace request body with validated/sanitized data
    req.body = value;
    
    // Continue to next middleware/handler
    next();
  };
};

export default validate;