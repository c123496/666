import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🔍 检查数据库表结构...\n');

    // 1. 检查 users 表
    console.log('1️⃣ users 表结构:');
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    usersColumns.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}${row.column_default ? ` (default: ${row.column_default})` : ''}`);
    });

    console.log('\n2️⃣ generated_images 表结构:');
    const imagesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_images'
      ORDER BY ordinal_position
    `);
    imagesColumns.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}${row.column_default ? ` (default: ${row.column_default})` : ''}`);
    });

    console.log('\n3️⃣ 检查是否有多个 users 表（Prisma vs Drizzle）:');
    const tables = await pool.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_name LIKE '%user%'
      ORDER BY table_name
    `);
    tables.rows.forEach(row => {
      console.log(`   ${row.table_schema}.${row.table_name}`);
    });

  } finally {
    await pool.end();
  }
}

checkDatabase().catch(console.error);
