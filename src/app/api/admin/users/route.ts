import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { nickname: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // 获取用户列表
    const userList = await prisma.user.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // 获取总数
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      users: userList.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.profile?.nickname || user.email.split('@')[0],
        role: user.role,
        status: 'active', // Prisma User 没有状态字段，默认为 active
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
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
