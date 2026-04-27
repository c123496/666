import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * 测试邮件发送接口
 * GET /api/test-email
 *
 * 用于开发测试 Resend 配置是否正确
 */
export async function GET(request: NextRequest) {
  console.log('\n' + '='.repeat(60));
  console.log('测试邮件接口被调用');
  console.log('='.repeat(60));

  try {
    // 1. 检查环境变量
    console.log('\n【1. 检查环境变量】');
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || '纸片人男友';
    const testToEmail = process.env.RESEND_TEST_TO_EMAIL;

    console.log('  RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ 未配置');
    console.log('  RESEND_FROM_EMAIL:', fromEmail);
    console.log('  RESEND_FROM_NAME:', fromName);
    console.log('  RESEND_TEST_TO_EMAIL:', testToEmail || '❌ 未配置');

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY 环境变量未配置',
          hint: '请在 .env.local 中添加 RESEND_API_KEY=re_xxxxx',
        },
        { status: 500 }
      );
    }

    if (!testToEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_TEST_TO_EMAIL 环境变量未配置',
          hint: '请在 .env.local 中添加 RESEND_TEST_TO_EMAIL=your@email.com',
          note: '测试邮箱必须是你注册 Resend 时使用的邮箱',
        },
        { status: 500 }
      );
    }

    // 2. 初始化 Resend
    console.log('\n【2. 初始化 Resend 客户端】');
    const resend = new Resend(apiKey);
    console.log('  ✅ Resend 客户端初始化成功');

    // 3. 发送测试邮件
    console.log('\n【3. 发送测试邮件】');
    console.log('  发件人:', `${fromName} <${fromEmail}>`);
    console.log('  收件人:', testToEmail);
    console.log('  主题: 虚拟男友测试邮件');

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [testToEmail],
      subject: '虚拟男友测试邮件 ✅',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 测试成功！</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Resend 邮件服务已正确配置</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
            <h2 style="color: #333; margin-top: 0;">你好！</h2>
            <p style="color: #666; line-height: 1.6;">
              如果你收到这封邮件，说明 Resend 配置完全正确！🎊
            </p>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">
                ✅ 邮件服务状态：正常
              </p>
            </div>
            <h3 style="color: #333;">邮件详情：</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>发送时间：${new Date().toLocaleString('zh-CN')}</li>
              <li>发件人：${fromName} &lt;${fromEmail}&gt;</li>
              <li>收件人：${testToEmail}</li>
              <li>环境：${process.env.NODE_ENV}</li>
            </ul>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              — 来自虚拟男友项目
            </p>
          </div>
        </div>
      `,
    });

    // 4. 检查结果
    console.log('\n【4. 检查发送结果】');

    if (error) {
      console.error('  ❌ Resend API 返回错误');
      console.error('  错误名称:', error.name);
      console.error('  错误消息:', error.message);
      console.error('  错误状态码:', error.statusCode);

      return NextResponse.json(
        {
          success: false,
          error: 'Resend API 返回错误',
          details: {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
          },
        },
        { status: 500 }
      );
    }

    console.log('  ✅ 邮件发送成功！');
    console.log('  邮件 ID:', data?.id);
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！请检查邮箱（包括垃圾邮件文件夹）');
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      message: '测试邮件发送成功！请检查邮箱',
      data: {
        id: data?.id,
        to: testToEmail,
        from: `${fromName} <${fromEmail}>`,
        sentAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 测试邮件发送失败');
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
        hint: '请检查 .env.local 中的 RESEND_API_KEY 是否正确',
      },
      { status: 500 }
    );
  }
}
