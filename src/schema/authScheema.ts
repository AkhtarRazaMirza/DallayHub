import { z } from "zod";

/**
 * Auth/User Schema Validation
 * Defines the structure of user data as returned from API endpoints
 * Ensures API responses match expected type structure
 * 
 * Note: This schema should match the database schema in src/db/schema.ts
 * Field names use API naming (camelCase) which may differ from database names
 */
export const authValidation = z.object({
  // Unique user identifier
  id: z.string().uuid("Invalid user ID format"),
  
  // User's first name
  firstName: z.string(),
  
  // User's last name (optional)
  lastName: z.string().optional(),
  
  // User's email address
  email: z.string().email("Invalid email format"),
  
  // Email verification status
  isVerified: z.boolean().default(false),
  
  // Account creation timestamp
  createdAt: z.date(),
  
  // Last update timestamp
  updatedAt: z.date(),
});

// TypeScript type inferred from Zod schema
export type Auth = z.infer<typeof authValidation>;