import { z } from "zod";
import { BaseDto } from "../../utils/base.dto.js";

/**
 * Password Reset Data Transfer Object
 * Validates new password input during password reset flow
 * Enforces same strong password requirements as registration
 * 
 * Validation Rules:
 * - newPassword: Minimum 8 chars, must include uppercase letter and digit
 */
class ResetPasswordDto extends BaseDto<{ newPassword: string }> {
  static schema = z.object({
    // New password with strength requirements
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain at least one uppercase letter and one digit",
      }),
  });
}

export default ResetPasswordDto;