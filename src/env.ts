import { z } from "zod";

/**
 * Environment Variables Schema & Validation
 * Uses Zod for runtime type-safe environment validation
 * Fails fast on startup if required variables are missing
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("8080"),
  
  // JWT Access Token (short-lived, for API requests)
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  
  // JWT Refresh Token (long-lived, for refreshing access tokens)
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  
  // Database Configuration
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Email Configuration (SMTP)
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.string().optional().default("587"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  SMTP_FROM_NAME: z.string().optional().default("DallyHub"),
  SMTP_FROM_EMAIL: z.string().email("SMTP_FROM_EMAIL must be valid email"),
  
  // Frontend URL for email links
  CLIENT_URL: z.string().url("CLIENT_URL must be valid URL"),
});

/**
 * Validates and parses environment variables
 * Throws error immediately on validation failure
 * 
 * @param env - Node.js process environment object
 * @returns Validated environment variables with proper types
 * @throws Error if validation fails
 */
function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);

  if (!safeParseResult.success) {
    console.error("❌ Invalid environment variables:", safeParseResult.error.format());
    throw new Error("Environment validation failed - check .env file");
  }

  return safeParseResult.data;
}

// Export validated environment variables for use throughout application
export const env = createEnv(process.env);