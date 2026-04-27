import { sendAlertEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron / cron-job.org: AI 接口健康检查
 *
 * 访问路径：/api/cron/health-check
 *
 * 鉴权方式（支持两种）：
 * 1. Header: Authorization: Bearer CRON_SECRET
 * 2. Query 参数: ?secret=CRON_SECRET
 *
 * 外部 Cron 服务调用方式：
 * - Header 方式：
 *   curl -H "Authorization: Bearer your-secret" https://your-domain.com/api/cron/health-check
 *
 * - Query 方式：
 *   curl https://your-domain.com/api/cron/health-check?secret=your-secret
 *
 * 建议执行频率：每 10 分钟
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  // 检查环境变量
  if (!expectedSecret) {
    console.error('[HealthCheck] ❌ CRON_SECRET 未配置');
    return NextResponse.json(
      { error: 'CRON_SECRET 未配置' },
      { status: 500 }
    );
  }

  // 方式 1：从 Header 获取 Authorization
  const authHeader = request.headers.get('authorization');

  // 方式 2：从 query 参数获取 secret
  const querySecret = request.nextUrl.searchParams.get('secret');

  // 验证两种方式：Header 或 Query
  const isAuthorizedByHeader = authHeader === `Bearer ${expectedSecret}`;
  const isAuthorizedByQuery = querySecret === expectedSecret;
  const isAuthorized = isAuthorizedByHeader || isAuthorizedByQuery;

  console.log('[HealthCheck] 🔍 鉴权检查:', {
    hasAuthHeader: !!authHeader,
    hasQuerySecret: !!querySecret,
    isAuthorized,
  });

  if (!isAuthorized) {
    console.warn('[HealthCheck] ❌ 未授权访问');

    return NextResponse.json(
      {
        error: '未授权访问',
        debug: {
          hasAuthHeader: !!authHeader,
          hasQuerySecret: !!querySecret,
          hasExpectedSecret: !!expectedSecret,
        },
      },
      { status: 401 }
    );
  }

  console.log('[HealthCheck] ✅ 鉴权通过，开始执行 -', new Date().toISOString());

  try {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as {
        service: string;
        errorName: string;
        errorMessage: string;
        statusCode?: number;
        rawError?: any;
      }[],
    };

    // 检查 1：EvoLink API（文本生成）
    results.total++;
    try {
      await checkEvoLinkAPI();
      results.success++;
      console.log('[HealthCheck] ✅ EvoLink API 正常');
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        service: 'EvoLink API',
        errorName: error.name || 'UnknownError',
        errorMessage: error.message || '未知错误',
        statusCode: error.statusCode,
        rawError: error.rawError || error,
      });
      console.error('[HealthCheck] ❌ EvoLink API 异常:', error.message);

      // 发送报警邮件
      try {
        await sendAlertEmail(
          'EvoLink API',
          error.message,
          {
            statusCode: error.statusCode,
            response: error.rawError,
            timestamp: new Date().toISOString(),
          }
        );
        console.log('[HealthCheck] 📧 报警邮件已发送');
      } catch (emailError: any) {
        console.error('[HealthCheck] ❌ 发送报警邮件失败:', emailError.message);
      }
    }

    console.log('[HealthCheck] ✅ 健康检查完成:', {
      总计: results.total,
      成功: results.success,
      失败: results.failed,
    });

    return NextResponse.json({
      success: true,
      message: `AI 接口健康检查完成：正常 ${results.success}，异常 ${results.failed}`,
      time: new Date().toISOString(),
      data: results,
    });
  } catch (error: any) {
    console.error('[HealthCheck] ❌ 健康检查执行失败：', {
      错误名称: error.name,
      错误消息: error.message,
      错误堆栈: error.stack,
    });

    return NextResponse.json(
      {
        error: '健康检查执行失败',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 检查 EvoLink API 是否正常
 * 发送一个简单的测试请求，10秒超时
 */
async function checkEvoLinkAPI(): Promise<void> {
  const EvoLink_API_KEY = process.env.EVOLINK_API_KEY;
  const EvoLink_BASE_URL = process.env.EVOLINK_BASE_URL || 'https://api.evolink.ai';

  console.log('[HealthCheck] 🔍 检查 EvoLink API...');
  console.log('[HealthCheck]   - API URL:', EvoLink_BASE_URL);
  console.log('[HealthCheck]   - API Key 存在:', !!EvoLink_API_KEY);

  if (!EvoLink_API_KEY) {
    throw new Error('EVOLINK_API_KEY 未配置');
  }

  try {
    // 使用 AbortController 设置 10 秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${EvoLink_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EvoLink_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-lite',
        messages: [
          {
            role: 'user',
            content: 'ping',
          },
        ],
        max_tokens: 10,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EvoLink API 返回错误 ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // 检查响应是否有效
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('EvoLink API 返回格式异常');
    }

    console.log('[HealthCheck]   ✅ EvoLink API 响应正常');
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('EvoLink API 请求超时（10秒）');
    }
    throw error;
  }
}
