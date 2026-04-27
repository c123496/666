import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * 开发测试：重发欢迎邮件
 * POST /api/test-welcome-email
 *
 * 仅用于开发测试，通过环境变量 ENABLE_TEST_EMAIL 控制
 */
export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(60));
  console.log('测试接口：重发欢迎邮件');
  console.log('='.repeat(60));

  // 1. 环境检查：通过环境变量控制
  const isTestEnabled = process.env.ENABLE_TEST_EMAIL === 'true';

  console.log('ENABLE_TEST_EMAIL:', process.env.ENABLE_TEST_EMAIL);
  console.log('isTestEnabled:', isTestEnabled);

  if (!isTestEnabled) {
    console.error('❌ 测试接口未启用');
    console.error('   请在环境变量中设置 ENABLE_TEST_EMAIL=true');
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

    // 3. 查询用户是否存在
    console.log('\n【查询用户】');
    console.log('  正在查询用户:', email);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
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

    console.log('\n【发送欢迎邮件】');
    console.log('  准备发送欢迎邮件到:', email);
    console.log('  用户昵称:', userName);

    // 5. 调用公共的邮件发送函数
    const result = await sendWelcomeEmail(email, userName);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 欢迎邮件发送成功！');
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      message: '欢迎邮件已发送',
      resendId: result.data?.id,
      data: {
        userId: user.id,
        email: email,
        userName: userName,
      },
    });

  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 发送欢迎邮件失败');
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
