import { sendDailyLoveLetterToAll } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron / cron-job.org: 每日情书定时发送
 *
 * 访问路径：/api/cron/daily-love-letter
 * 鉴权方式：query 参数 ?secret=CRON_SECRET
 *
 * 外部 Cron 服务调用方式：
 * https://your-domain.com/api/cron/daily-love-letter?secret=your-secret-key
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  // 检查环境变量
  if (!expectedSecret) {
    console.error('[Cron] CRON_SECRET 未配置');
    return NextResponse.json(
      { error: 'CRON_SECRET 未配置' },
      { status: 500 }
    );
  }

  // 从 query 参数获取 secret
  const secret = request.nextUrl.searchParams.get('secret');

  // 验证 secret
  if (secret !== expectedSecret) {
    console.warn('[Cron] 未授权访问 - secret 不匹配');
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  console.log('[Cron] 开始执行每日情书批量发送 -', new Date().toISOString());

  try {
    const results = await sendDailyLoveLetterToAll();

    console.log('[Cron] 批量发送完成:', {
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
    console.error('[Cron] 每日情话发送失败：', {
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
