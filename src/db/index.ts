import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

// Reuse the already-installed pg driver for Drizzle.
const client = new Pool({ connectionString });

export const db = drizzle(client, { schema });
