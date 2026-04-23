import { pgTable, varchar, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * PostgreSQL Users Table Schema
 * Stores user account information with email verification and password security
 * 
 * Fields:
 * - id: UUID primary key, auto-generated
 * - firstName: User's first name (required)
 * - lastName: User's last name (optional)
 * - email: User's email address (unique, required)
 * - isVerified: Email verification status (default: false)
 * - password: Hashed password using bcryptjs (max 66 chars for bcrypt hash)
 * - salt: Bcrypt salt used for password hashing
 * - createdAt: Account creation timestamp (auto-set)
 * - updatedAt: Last update timestamp (auto-updated)
 */
export const usersTable = pgTable("users", {
  // Unique identifier for each user
  id: uuid("id").primaryKey().defaultRandom(),
  
  // User's first name (required)
  firstName: varchar("first_name", { length: 45 }).notNull(),
  
  // User's last name (optional)
  lastName: varchar("last_name", { length: 45 }),
  
  // User's email address (unique constraint, required)
  email: varchar("email", { length: 322 }).notNull().unique(),
  
  // Email verification flag (true after user clicks verification link)
  isVerified: boolean("is_verified").default(false).notNull(),
  
  // Hashed password (bcryptjs produces 60 char hashes, storing 66 for safety)
  password: varchar("password", { length: 66 }).notNull(),
  
  // Account creation timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Last update timestamp (auto-updates on every change)
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});