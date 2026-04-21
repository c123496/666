import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, finalScore, result } = body;

    // 验证输入
    if (!scenario || finalScore === undefined || !result) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取用户ID
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 暂时只记录到控制台，等后续添加 GameRecord 模型
    console.log('游戏记录:', { userId, scenario, finalScore, result });

    // 如果通关，给用户增加积分
    if (result === '通关') {
      await prisma.userProfile.update({
        where: { userId },
        data: {
          points: {
            increment: finalScore,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '游戏记录功能正在开发中，积分已更新',
    });
  } catch (error) {
    console.error('保存游戏记录失败:', error);
    return NextResponse.json(
      { error: '保存失败，请稍后重试' },
      { status: 500 }
    );
  }
}
