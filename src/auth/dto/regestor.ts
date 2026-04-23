import { z } from "zod";
import { BaseDto } from "../../utils/base.dto.js";

/**
 * User Registration Data Transfer Object
 * Validates user registration input before database operations
 * Enforces strong password requirements
 * 
 * Validation Rules:
 * - firstName: 2-50 characters
 * - lastName: 2-50 characters
 * - email: Valid email format
 * - password: Minimum 8 chars, must include uppercase letter and digit
 * - role: Either 'user' or 'admin' (defaults to 'user')
 */
class RegisterDto extends BaseDto<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "admin";
}> {
  static schema = z.object({
    // User's first name
    firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50, "First name must be max 50 characters"),

    // User's last name
     lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(50, "Last name must be max 50 characters"),
    // User's email address
    email: z.string().email("Invalid email format"),
    
    // Password with strength requirements
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain at least one uppercase letter and one digit",
      }),
    
    // User role assignment (defaults to regular user)
    role: z.enum(["user", "admin"]).default("user"),
  });
}

export default RegisterDto;
