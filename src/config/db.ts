import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

/**
 * Drizzle ORM Database Client
 * Uses PostgreSQL driver (node-postgres) for database operations
 * Connection URL comes from DATABASE_URL environment variable
 * 
 * The actual database connection is lazy-loaded on first query execution
 * This allows the server to start even if the database is temporarily unavailable
 */
export const db = drizzle(process.env.DATABASE_URL!);