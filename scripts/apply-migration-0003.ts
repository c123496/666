import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🔄 应用 migration: 修改 generated_images.user_id 为 text\n');

    // 修改 generated_images 表
    console.log('修改 generated_images.user_id...');
    await pool.query(`ALTER TABLE "generated_images" DROP CONSTRAINT IF EXISTS "generated_images_user_id_users_id_fk"`);
    await pool.query(`ALTER TABLE "generated_images" ALTER COLUMN "user_id" TYPE text USING user_id::text`);
    console.log('✅ user_id 类型已改为 text');

    console.log('\n✅ Migration 应用成功！');
    console.log('   generated_images.user_id 现在是 text 类型，匹配 Prisma users.id');
  } catch (error) {
    console.error('❌ Migration 失败:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration().catch(console.error);
