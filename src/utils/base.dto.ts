import type { ZodSchema, ZodIssue } from "zod";

/**
 * Base Data Transfer Object (DTO) Class
 * Provides reusable validation logic for all DTO classes
 * Uses Zod for schema definition and validation
 * 
 * Usage:
 * 1. Create a DTO class extending BaseDto
 * 2. Define static schema with Zod
 * 3. Call validate() to check incoming data
 * 
 * Example:
 * ```
 * class UserDTO extends BaseDto<User> {
 *   static schema = z.object({ name: z.string() });
 * }
 * const result = UserDTO.validate(data);
 * ```
 */
export class BaseDto<T> {
  // Each DTO class must define this schema
  static schema: ZodSchema;

  /**
   * Validates data against the Zod schema
   * Returns structured result with either errors or parsed value
   * Never throws - always returns result object
   * 
   * @param data - Raw input data to validate
   * @returns Object with errors array (if invalid) or parsed value (if valid)
   */
  static validate<T>(
    this: { schema: ZodSchema<T> },
    data: unknown
  ): { errors: string[] | null; value: T | null } {
    // Use safeParse to avoid throwing exceptions
    const result = this.schema.safeParse(data);

    // If validation fails, extract error messages
    if (!result.success) {
      const errors = result.error.issues.map((e: ZodIssue) => e.message);
      return { errors, value: null };
    }

    // If validation succeeds, return parsed value
    return { errors: null, value: result.data };
  }
}
