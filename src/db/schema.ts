import { pgTable, serial, text, timestamp, decimal, boolean, varchar, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表由 Prisma 管理，这里不需要定义
// 实际的 users 表结构请参考 prisma/schema.prisma

// 订单表
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNo: varchar('order_no', { length: 50 }).notNull().unique(),
  userId: text('user_id').notNull(), // 用户ID（Prisma User.id 是 text 类型）
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, paid, cancelled, refunded
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderNoIdx: index('orders_order_no_idx').on(table.orderNo),
  userIdIdx: index('orders_user_id_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
}));

// 游戏记录表
export const gameRecords = pgTable('game_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // 用户ID（Prisma User.id 是 text 类型）
  scenario: varchar('scenario', { length: 100 }).notNull(), // 场景名称（角色名称）
  finalScore: integer('final_score').notNull(), // 最终好感度分数
  result: varchar('result', { length: 20 }).notNull(), //通关/失败
  playedAt: timestamp('played_at').notNull().defaultNow(), // 游戏时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('game_records_user_id_idx').on(table.userId),
  scenarioIdx: index('game_records_scenario_idx').on(table.scenario),
  resultIdx: index('game_records_result_idx').on(table.result),
  playedAtIdx: index('game_records_played_at_idx').on(table.playedAt),
}));

// AI 生成图片记录表
export const generatedImages = pgTable('generated_images', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // 用户ID（Prisma User.id 是 text 类型）
  imageUrl: text('image_url').notNull(), // R2 永久链接
  prompt: text('prompt').notNull(), // 生成提示词
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('generated_images_user_id_idx').on(table.userId),
  createdAtIdx: index('generated_images_created_at_idx').on(table.createdAt),
}));

// 注意：users 表由 Prisma 管理，不需要在这里定义 relations
// 如果需要 relations，请在 Prisma schema 中定义

// TypeScript 类型
// 注意：User 和 NewUser 类型由 Prisma 自动生成，这里不需要导出
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type GameRecord = typeof gameRecords.$inferSelect;
export type NewGameRecord = typeof gameRecords.$inferInsert;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;
