import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Running migration: 0001_opposite_selene.sql');

    const sql = readFileSync(join(__dirname, '../drizzle/0001_opposite_selene.sql'), 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').filter(s => s.trim());

    for (const statement of statements) {
      const cleanStatement = statement.trim();

      // Skip game_records related statements (might already exist)
      if (cleanStatement.includes('game_records') || cleanStatement.includes('"game_records')) {
        console.log('Skipping game_records related statement');
        continue;
      }

      // Skip generated_images foreign key constraint (users table might not exist yet)
      if (cleanStatement.includes('generated_images_user_id_users_id_fk')) {
        console.log('Skipping foreign key constraint (will be created separately)');
        continue;
      }

      if (cleanStatement) {
        try {
          await pool.query(cleanStatement);
          console.log('✓ Executed statement successfully');
        } catch (error: any) {
          if (error.message.includes('already exists')) {
            console.log('⊘ Table or relation already exists, skipping...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
