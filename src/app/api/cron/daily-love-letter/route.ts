import { sendDailyLoveLetterToAll } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron / cron-job.org: 每日情书定时发送
 *
 * 访问路径：/api/cron/daily-love-letter
 *
 * 鉴权方式（支持两种）：
 * 1. Header: Authorization: Bearer CRON_SECRET
 * 2. Query 参数: ?secret=CRON_SECRET
 *
 * 外部 Cron 服务调用方式：
 * - Header 方式：
 *   curl -H "Authorization: Bearer your-secret" https://your-domain.com/api/cron/daily-love-letter
 *
 * - Query 方式：
 *   curl https://your-domain.com/api/cron/daily-love-letter?secret=your-secret
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  // 检查环境变量
  if (!expectedSecret) {
    console.error('[Cron] ❌ CRON_SECRET 未配置');
    return NextResponse.json(
      { error: 'CRON_SECRET 未配置' },
      { status: 500 }
    );
  }

  // 方式 1：从 Header 获取 Authorization
  const authHeader = request.headers.get('authorization');

  // 方式 2：从 query 参数获取 secret
  const querySecret = request.nextUrl.searchParams.get('secret');

  // 调试日志：不打印完整 secret，只打印长度和前后几位
  console.log('[Cron] 🔍 鉴权调试信息:');
  console.log('[Cron]   - authHeader 存在:', !!authHeader);
  console.log('[Cron]   - querySecret 存在:', !!querySecret);
  console.log('[Cron]   - expectedSecret 存在:', !!expectedSecret);
  console.log('[Cron]   - expectedSecret 长度:', expectedSecret?.length);

  if (authHeader) {
    console.log('[Cron]   - authHeader 长度:', authHeader.length);
    console.log('[Cron]   - authHeader 前10位:', authHeader.substring(0, 10) + '...');
    console.log('[Cron]   - authHeader 后10位:', '...' + authHeader.slice(-10));
  }

  if (querySecret) {
    console.log('[Cron]   - querySecret 长度:', querySecret.length);
    console.log('[Cron]   - querySecret 前5位:', querySecret.substring(0, 5) + '...');
    console.log('[Cron]   - querySecret 后5位:', '...' + querySecret.slice(-5));
  }

  console.log('[Cron]   - expectedSecret 前5位:', expectedSecret.substring(0, 5) + '...');
  console.log('[Cron]   - expectedSecret 后5位:', '...' + expectedSecret.slice(-5));

  // 验证两种方式：Header 或 Query
  const isAuthorizedByHeader = authHeader === `Bearer ${expectedSecret}`;
  const isAuthorizedByQuery = querySecret === expectedSecret;
  const isAuthorized = isAuthorizedByHeader || isAuthorizedByQuery;

  console.log('[Cron]   - Header 鉴权通过:', isAuthorizedByHeader);
  console.log('[Cron]   - Query 鉴权通过:', isAuthorizedByQuery);
  console.log('[Cron]   - 总体鉴权通过:', isAuthorized);

  if (!isAuthorized) {
    console.warn('[Cron] ❌ 未授权访问');

    return NextResponse.json(
      {
        error: '未授权访问',
        debug: {
          hasAuthHeader: !!authHeader,
          hasQuerySecret: !!querySecret,
          hasExpectedSecret: !!expectedSecret,
          authHeaderLength: authHeader?.length || 0,
          querySecretLength: querySecret?.length || 0,
          expectedSecretLength: expectedSecret.length,
          authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : null,
          querySecretPrefix: querySecret ? querySecret.substring(0, 5) + '...' : null,
          expectedSecretPrefix: expectedSecret.substring(0, 5) + '...',
        },
      },
      { status: 401 }
    );
  }

  console.log('[Cron] ✅ 鉴权通过，开始执行 -', new Date().toISOString());

  try {
    const results = await sendDailyLoveLetterToAll();

    console.log('[Cron] ✅ 批量发送完成:', {
      总计: results.total,
      成功: results.success,
      失败: results.failed,
    });

    return NextResponse.json({
      success: true,
      message: `每日情话发送完成：成功 ${results.success}，失败 ${results.failed}`,
      time: new Date().toISOString(),
      data: results,
    });
  } catch (error: any) {
    console.error('[Cron] ❌ 每日情话发送失败：', {
      错误名称: error.name,
      错误消息: error.message,
      错误堆栈: error.stack,
    });

    return NextResponse.json(
      {
        error: '每日情话发送失败',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
