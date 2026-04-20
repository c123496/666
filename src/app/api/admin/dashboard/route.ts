import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { users, orders } from '@/db/schema';
import { sql, gte, count, eq } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();

    // 用户总数
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // 最近7天新增用户
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    const recentUsers = recentUsersResult[0]?.count || 0;

    // 订单总数
    const totalOrdersResult = await db
      .select({ count: count() })
      .from(orders);
    const totalOrders = totalOrdersResult[0]?.count || 0;

    // 最近7天订单
    const recentOrdersResult = await db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));
    const recentOrders = recentOrdersResult[0]?.count || 0;

    // 总成交额
    const totalRevenueResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
      .from(orders)
      .where(eq(orders.status, 'paid'));
    const totalRevenue = totalRevenueResult[0]?.sum || '0';

    // 最近7天成交额
    const recentRevenueResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));
    const recentRevenue = recentRevenueResult[0]?.sum || '0';

    return NextResponse.json({
      totalUsers,
      recentUsers,
      totalOrders,
      recentOrders,
      totalRevenue: totalRevenue.toString(),
      recentRevenue: recentRevenue.toString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
