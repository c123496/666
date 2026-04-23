import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';

// Cloudflare 官方测试 key（仅用于开发环境）
const TESTING_SITE_KEY = '1x00000000000000000000AA';
const TESTING_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 🔍 调试日志：打印接收到的所有字段
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('[注册] 接收到的请求体字段:', Object.keys(body));
      console.log('[注册] email 存在:', typeof body.email !== 'undefined', '类型:', typeof body.email);
      console.log('[注册] password 存在:', typeof body.password !== 'undefined', '类型:', typeof body.password);
      console.log('[注册] turnstileToken 存在:', typeof body.turnstileToken !== 'undefined', '长度:', body.turnstileToken?.length);
    }

    // 从请求体中拿到前端传来的 Turnstile token
    const { turnstileToken, ...registrationData } = body;

    if (isDevelopment) {
      console.log('[注册] 提取 turnstileToken 后剩余字段:', Object.keys(registrationData));
      console.log('[注册] registrationData.email:', typeof registrationData.email !== 'undefined' ? '存在' : 'undefined');
      console.log('[注册] registrationData.password:', typeof registrationData.password !== 'undefined' ? '存在' : 'undefined');
    }

    // 验证 token 是否存在
    if (!turnstileToken) {
      console.error('[注册] Token 缺失 - 前端未提交 turnstileToken');
      console.error('[注册] 收到的字段:', Object.keys(body));
      return NextResponse.json(
        {
          error: '请完成人机验证',
          field: 'turnstileToken',
        },
        { status: 400 }
      );
    }

    // 根据环境选择 secret key
    const isProduction = process.env.NODE_ENV === 'production';
    const envSecretKey = process.env.TURNSTILE_SECRET_KEY || '';
    const secretKey = (isProduction && envSecretKey) ? envSecretKey : TESTING_SECRET_KEY;

    // 调用 Cloudflare API 验证 token（带超时保护）
    let verifyResult;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: secretKey,
            response: turnstileToken,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      verifyResult = await verifyResponse.json();
    } catch (fetchError: any) {
      // 处理网络错误或超时
      if (fetchError.name === 'AbortError') {
        console.error('[Turnstile] 验证超时');
        return NextResponse.json(
          { error: '人机验证超时，请刷新页面重试' },
          { status: 504 }
        );
      }

      console.error('[Turnstile] 验证请求失败:', fetchError);
      return NextResponse.json(
        { error: '人机验证服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }

    // 如果验证失败，直接拒绝
    if (!verifyResult.success) {
      const errorCodes = verifyResult['error-codes'] || [];
      console.error('[Turnstile] 验证失败:', errorCodes);

      // 根据错误代码返回友好提示
      let errorMsg = '人机验证失败，请重试';

      if (errorCodes.includes('invalid-input-response')) {
        errorMsg = '验证响应无效，请刷新页面重试';
      } else if (errorCodes.includes('timeout-or-duplicate')) {
        errorMsg = '验证已过期或重复提交，请刷新页面重试';
      } else if (errorCodes.includes('internal-error')) {
        errorMsg = '验证服务内部错误，请稍后重试';
      }

      return NextResponse.json(
        { error: errorMsg },
        { status: 403 }
      );
    }

    // 验证通过，继续正常的注册流程
    const validationResult = registerSchema.safeParse(registrationData);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      console.error('[注册] 数据验证失败:', firstError.path, firstError.message);

      // 返回更友好的错误提示
      const fieldErrors: Record<string, string> = {
        email: '邮箱',
        password: '密码',
      };

      const fieldName = firstError.path[0] as string;
      const fieldLabel = fieldErrors[fieldName] || fieldName;

      return NextResponse.json(
        {
          error: `${fieldLabel}${firstError.message}`,
          field: fieldName,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('[注册] 邮箱已被注册:', email);
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

    console.log('[注册] 用户创建成功, ID:', user.id);

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
    console.error('[注册] 服务器错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
