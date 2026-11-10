import { drizzle } from 'drizzle-orm/neon-serverless';

/** Koneksi Neon Postgres via Drizzle ORM (connection string). */
export const db = drizzle(process.env.DATABASE_URL!);