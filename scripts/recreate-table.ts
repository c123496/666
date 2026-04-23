import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function recreateTable() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Recreating generated_images table with correct types...\n');

    // Drop existing table
    console.log('Dropping existing table...');
    await pool.query('DROP TABLE IF EXISTS "generated_images" CASCADE');
    console.log('✓ Table dropped');

    // Create table with correct types
    console.log('\nCreating table with correct types...');
    await pool.query(`
      CREATE TABLE "generated_images" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "image_url" text NOT NULL,
        "prompt" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query('CREATE INDEX "generated_images_user_id_idx" ON "generated_images" USING btree ("user_id")');
    await pool.query('CREATE INDEX "generated_images_created_at_idx" ON "generated_images" USING btree ("created_at")');
    console.log('✓ Indexes created');

    // Add foreign key constraint
    console.log('\nAdding foreign key constraint...');
    await pool.query(`
      ALTER TABLE "generated_images"
      ADD CONSTRAINT "generated_images_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action
    `);
    console.log('✓ Foreign key constraint added');

    console.log('\n✅ Table recreated successfully!');
  } catch (error) {
    console.error('Failed to recreate table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

recreateTable().catch(console.error);
