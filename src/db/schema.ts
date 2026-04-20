import { pgTable, serial, text, timestamp, decimal, boolean, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // 密码哈希，可为空（支持第三方登录）
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, suspended, deleted
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
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

// 定义表之间的关系
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

// TypeScript 类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
