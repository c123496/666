import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedRole } = body;

    console.log('=== 选择角色请求 ===');
    console.log('选择的角色:', selectedRole);

    // 获取用户ID
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 验证角色是否有效（使用原项目的角色 ID）
    const validRoles = ['ceo', 'sweet', 'actor', 'striver'];
    if (!selectedRole || !validRoles.includes(selectedRole)) {
      return NextResponse.json(
        { error: '无效的角色选择' },
        { status: 400 }
      );
    }

    // 检查用户资料是否存在
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // 如果用户资料不存在，创建一个
      await prisma.userProfile.create({
        data: {
          userId,
          selectedRole,
          points: 0,
        },
      });
    } else {
      // 更新用户资料
      await prisma.userProfile.update({
        where: { userId },
        data: { selectedRole },
      });
    }

    console.log('角色选择成功，userId:', userId, 'role:', selectedRole);

    return NextResponse.json({
      success: true,
      selectedRole,
    });
  } catch (error) {
    console.error('选择角色错误:', error);
    return NextResponse.json(
      { error: '保存角色失败，请稍后重试' },
      { status: 500 }
    );
  }
}
