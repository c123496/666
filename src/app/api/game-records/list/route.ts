import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRecords } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 获取用户ID
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 获取用户游戏记录，按时间倒序
    const records = await db
      .select()
      .from(gameRecords)
      .where(eq(gameRecords.userId, parseInt(userId)))
      .orderBy(desc(gameRecords.playedAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('获取游戏记录失败:', error);
    return NextResponse.json(
      { error: '获取失败，请稍后重试' },
      { status: 500 }
    );
  }
}
