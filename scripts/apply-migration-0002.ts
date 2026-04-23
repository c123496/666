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
    console.log('🔄 应用 migration: 修改 generated_images.user_id 类型\n');

    // 1. 检查当前类型
    console.log('1. 检查当前 user_id 类型...');
    const checkResult = await pool.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'generated_images'
      AND column_name = 'user_id'
    `);
    console.log('   当前类型:', checkResult.rows[0]?.data_type);

    // 2. 先删除外键约束
    console.log('\n2. 删除外键约束...');
    await pool.query(`
      ALTER TABLE "generated_images"
      DROP CONSTRAINT IF EXISTS "generated_images_user_id_users_id_fk"
    `);
    console.log('   ✅ 外键约束已删除');

    // 3. 修改列类型为 integer
    console.log('\n3. 修改 user_id 列类型为 integer...');
    await pool.query(`
      ALTER TABLE "generated_images"
      ALTER COLUMN "user_id" TYPE integer USING user_id::integer
    `);
    console.log('   ✅ 列类型已修改为 integer');

    // 4. 设置默认值为序列
    console.log('\n4. 设置默认值序列...');
    await pool.query(`
      ALTER TABLE "generated_images"
      ALTER COLUMN "user_id" SET DEFAULT nextval('generated_images_id_seq')
    `);
    console.log('   ✅ 默认值序列已设置');

    // 5. 重新添加外键约束
    console.log('\n5. 重新添加外键约束...');
    await pool.query(`
      ALTER TABLE "generated_images"
      ADD CONSTRAINT "generated_images_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    console.log('   ✅ 外键约束已添加');

    // 6. 设置 NOT NULL
    console.log('\n6. 确保 NOT NULL 约束...');
    await pool.query(`
      ALTER TABLE "generated_images"
      ALTER COLUMN "user_id" SET NOT NULL
    `);
    console.log('   ✅ NOT NULL 约束已设置');

    console.log('\n✅ Migration 应用成功！');
    console.log('   generated_images.user_id 现在是 integer 类型，与 users.id 一致');
  } catch (error) {
    console.error('❌ Migration 失败:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration().catch(console.error);
