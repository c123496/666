import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function addForeignKey() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Adding foreign key constraint for generated_images...');

    // Add foreign key constraint
    await pool.query(`
      ALTER TABLE "generated_images"
      ADD CONSTRAINT "generated_images_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action
    `);

    console.log('✓ Foreign key constraint added successfully!');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('⊘ Foreign key constraint already exists');
    } else {
      console.error('Failed to add foreign key constraint:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

addForeignKey().catch(console.error);
