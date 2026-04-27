import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailyLoveLetter } from '@/lib/email';

/**
 * 开发测试：发送每日情书
 * POST /api/test-love-letter
 *
 * 仅用于开发测试，通过环境变量 ENABLE_TEST_EMAIL 控制
 */
export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(60));
  console.log('测试接口：发送每日情书');
  console.log('='.repeat(60));

  // 1. 环境检查
  const isTestEnabled = process.env.ENABLE_TEST_EMAIL === 'true';

  if (!isTestEnabled) {
    console.error('❌ 测试接口未启用');
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: '测试接口未启用，请在环境变量中设置 ENABLE_TEST_EMAIL=true',
      },
      { status: 403 }
    );
  }

  try {
    // 2. 解析请求体
    const body = await request.json();
    const { email } = body;

    console.log('\n【请求参数】');
    console.log('  Email:', email || '(未提供)');

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: '请提供邮箱地址',
        },
        { status: 400 }
      );
    }

    // 3. 查询用户
    console.log('\n【查询用户】');
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      console.log('  ❌ 用户不存在');
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在',
          message: `邮箱 ${email} 未注册`,
        },
        { status: 404 }
      );
    }

    console.log('  ✅ 用户存在');
    console.log('  用户 ID:', user.id);
    console.log('  用户昵称:', user.profile?.nickname || '(未设置)');

    // 4. 获取用户昵称
    const userName = user.profile?.nickname || user.email.split('@')[0];

    console.log('\n【发送每日情书】');
    console.log('  准备发送情书到:', email);
    console.log('  用户昵称:', userName);

    // 5. 发送情书
    const result = await sendDailyLoveLetter(email, userName);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 每日情书发送成功！');
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      message: '每日情书已发送',
      resendId: result.data?.id,
      data: {
        userId: user.id,
        email: email,
        userName: userName,
      },
    });

  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 发送每日情书失败');
    console.error('='.repeat(60));
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('='.repeat(60) + '\n');

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}
