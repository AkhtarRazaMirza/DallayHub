import { z } from "zod";
import { BaseDto } from "../../utils/base.dto.js";

/**
 * User Login Data Transfer Object
 * Validates login credentials before authentication
 * 
 * Validation Rules:
 * - email: Valid email format (converted to lowercase for case-insensitive matching)
 * - password: Non-empty string
 */
class LoginDto extends BaseDto<{ email: string; password: string }> {
  static schema = z.object({
    // User's email address (normalized to lowercase for consistent matching)
    email: z.string().email("Invalid email format").toLowerCase().min(1),
    
    // User's password (should be verified against bcrypt hash in database)
    password: z.string().min(1, "Password is required"),
  });
}

export default LoginDto;
