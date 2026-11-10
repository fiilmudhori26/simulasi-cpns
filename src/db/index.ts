import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

/** Koneksi Neon Postgres via Drizzle ORM (connection string). */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool);
