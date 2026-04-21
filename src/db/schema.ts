import { pgTable, serial, text, timestamp, decimal, boolean, varchar, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(), // 用户名，唯一
  password: varchar('password', { length: 255 }).notNull(), // 密码哈希
  name: varchar('name', { length: 100 }), // 显示名称（可选）
  email: varchar('email', { length: 255 }), // 邮箱（可选）
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, suspended, deleted
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  usernameIdx: index('users_username_idx').on(table.username),
  emailIdx: index('users_email_idx').on(table.email),
  statusIdx: index('users_status_idx').on(table.status),
}));

// 订单表
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNo: varchar('order_no', { length: 50 }).notNull().unique(),
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
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
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// 定义表之间的关系
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  gameRecords: many(gameRecords),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const gameRecordsRelations = relations(gameRecords, ({ one }) => ({
  user: one(users, {
    fields: [gameRecords.userId],
    references: [users.id],
  }),
}));

// TypeScript 类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type GameRecord = typeof gameRecords.$inferSelect;
export type NewGameRecord = typeof gameRecords.$inferInsert;
