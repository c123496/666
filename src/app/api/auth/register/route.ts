import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== 注册请求 ===');
    console.log('收到的数据:', {
      ...body,
      password: '***',
      turnstileToken: body.turnstileToken ? '***HAS_TOKEN***' : 'NO_TOKEN'
    });

    // 从请求体中拿到前端传来的 Turnstile token
    const { turnstileToken, ...registrationData } = body;

    // 验证 token 是否存在
    if (!turnstileToken) {
      console.log('❌ Turnstile token 缺失');
      return NextResponse.json(
        { error: '请完成人机验证' },
        { status: 403 }
      );
    }

    // 获取 secret key
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // 开发环境：打印 secret key 状态（不打印完整值）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Turnstile Debug] TURNSTILE_SECRET_KEY exists:', !!secretKey);
      console.log('[Turnstile Debug] TURNSTILE_SECRET_KEY length:', secretKey?.length || 0);
      console.log('[Turnstile Debug] Turnstile token exists:', !!turnstileToken);
      console.log('[Turnstile Debug] Turnstile token length:', turnstileToken?.length || 0);
    }

    // 如果没有配置 secret key，开发环境跳过验证
    if (!secretKey) {
      console.warn('⚠️ TURNSTILE_SECRET_KEY 未配置，跳过验证（仅开发环境）');
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: '服务器配置错误' },
          { status: 500 }
        );
      }
    } else {
      // 去 Cloudflare 验证这个 token 是不是真的
      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: secretKey,
            response: turnstileToken,
          }),
        }
      );

      const verifyResult = await verifyResponse.json();

      // 开发环境：打印验证结果
      if (process.env.NODE_ENV === 'development') {
        console.log('[Turnstile Debug] Verification result:', {
          success: verifyResult.success,
          'error-codes': verifyResult['error-codes'] || [],
          challenge_ts: verifyResult.challenge_ts || null,
        });
      }

      // 如果验证失败，直接拒绝
      if (!verifyResult.success) {
        console.log('❌ Turnstile 验证失败:', verifyResult);
        return NextResponse.json(
          {
            error: '人机验证失败，请重试',
            debug: process.env.NODE_ENV === 'development' ? verifyResult['error-codes'] : undefined
          },
          { status: 403 }
        );
      }

      console.log('✅ Turnstile 验证通过');
    }

    // 验证通过，继续正常的注册流程
    const validationResult = registerSchema.safeParse(registrationData);

    if (!validationResult.success) {
      console.log('❌ 数据验证失败:', validationResult.error.issues);
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    console.log('✅ 数据验证通过，email:', email);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ 邮箱已被注册');
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户（同时创建 UserProfile）
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'user',
        profile: {
          create: {
            points: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log('✅ 用户创建成功，ID:', user.id);

    // 设置会话
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );

    // 设置用户ID到cookie
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ 注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
