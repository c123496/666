import { sendDailyLoveLetterToAll } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron: 每日情书定时发送
 * 路径: /api/cron/daily-love-letter
 * 触发: 每天早上 8:00 (UTC)
 * Cron 表达式: 0 8 * * *
 *
 * Vercel Cron 文档: https://vercel.com/docs/cron-jobs
 */
export async function GET(request: NextRequest) {
  console.log('\n' + '='.repeat(60));
  console.log('💌 Cron Job: 每日情书批量发送');
  console.log('时间:', new Date().toISOString());
  console.log('='.repeat(60));

  // 第一步：验证请求是否合法
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ 未授权的 Cron 请求');
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  // 第二步：执行任务——给所有用户发情话邮件
  try {
    const results = await sendDailyLoveLetterToAll();

    console.log('\n' + '='.repeat(60));
    console.log(`✅ 批量发送完成`);
    console.log(`   总计: ${results.total}`);
    console.log(`   成功: ${results.success}`);
    console.log(`   失败: ${results.failed}`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      message: `批量发送完成：成功 ${results.success}，失败 ${results.failed}`,
      data: results,
    });
  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Cron Job 执行失败');
    console.error('='.repeat(60));
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('='.repeat(60) + '\n');

    return NextResponse.json(
      { error: '发送失败', details: error.message },
      { status: 500 }
    );
  }
}
