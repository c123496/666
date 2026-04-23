import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Checking database schema...\n');

    // Check users table structure
    const usersResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n');

    // Check generated_images table structure
    const imagesResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'generated_images'
      ORDER BY ordinal_position
    `);
    console.log('Generated_images table columns:');
    imagesResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

  } finally {
    await pool.end();
  }
}

checkSchema().catch(console.error);
