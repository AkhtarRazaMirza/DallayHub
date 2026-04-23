import { z } from "zod";
import { BaseDto } from "../../utils/base.dto.js";

/**
 * Forgot Password Request Data Transfer Object
 * Validates email input for password reset requests
 * 
 * Validation Rules:
 * - email: Valid email format (converted to lowercase for case-insensitive matching)
 */
class ForgotPasswordDto extends BaseDto<{ email: string }> {
  static schema = z.object({
    // User's email address (normalized to lowercase)
    email: z.string().email("Invalid email format").toLowerCase().min(1),
  });
}

export default ForgotPasswordDto;
