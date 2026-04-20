import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { sql, or, and, ilike, eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions: any[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }

    // 获取用户列表
    const userList = await db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(users.createdAt)],
      limit,
      offset,
    });

    // 获取总数
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      users: userList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}
