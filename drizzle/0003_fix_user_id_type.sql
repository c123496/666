-- Migration: 修改所有表的 user_id 类型从 integer 改为 text（匹配 Prisma users.id）

-- 1. game_records 表
ALTER TABLE "game_records" DROP CONSTRAINT IF EXISTS "game_records_user_id_users_id_fk";
ALTER TABLE "game_records" ALTER COLUMN "user_id" TYPE text USING user_id::text;
ALTER TABLE "game_records" ALTER COLUMN "user_id" SET NOT NULL;

-- 2. generated_images 表
ALTER TABLE "generated_images" DROP CONSTRAINT IF EXISTS "generated_images_user_id_users_id_fk";
ALTER TABLE "generated_images" ALTER COLUMN "user_id" TYPE text USING user_id::text;
ALTER TABLE "generated_images" ALTER COLUMN "user_id" SET NOT NULL;

-- 3. orders 表
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_users_id_fk";
ALTER TABLE "orders" ALTER COLUMN "user_id" TYPE text USING user_id::text;
ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL;

-- 重新创建索引（如果需要）
CREATE INDEX IF NOT EXISTS "game_records_user_id_idx" ON "game_records" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "generated_images_user_id_idx" ON "generated_images" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" USING btree ("user_id");
