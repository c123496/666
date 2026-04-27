#!/usr/bin/env node

/**
 * 测试脚本：验证 /api/cron/daily-love-letter 接口
 *
 * 运行方式：
 * node scripts/test-cron-love-letter.js
 */

const testCronAPI = async () => {
  console.log('\n========================================');
  console.log('测试 /api/cron/daily-love-letter 接口');
  console.log('========================================\n');

  const apiUrl = 'http://localhost:5000/api/cron/daily-love-letter';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log('API URL:', apiUrl);
  console.log('Cron Secret:', cronSecret ? '已设置' : '未设置（本地开发可跳过）');
  console.log('\n发送 GET 请求...\n');

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // 如果设置了 CRON_SECRET，添加 Authorization header
    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    console.log('响应状态:', response.status, response.statusText);

    const data = await response.json();
    console.log('\n响应数据:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n========================================');
    if (response.ok) {
      console.log('✅ 测试成功！');
      if (data.data) {
        console.log(`   总计: ${data.data.total} 用户`);
        console.log(`   成功: ${data.data.success}`);
        console.log(`   失败: ${data.data.failed}`);
      }
    } else {
      console.log('❌ 测试失败！');
      console.log('错误:', data.error || data.message);
    }
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ 请求失败');
    console.error('========================================');
    console.error('错误:', error.message);
    console.error('\n可能的原因：');
    console.error('1. 开发服务器未启动（请运行 pnpm dev）');
    console.error('2. 端口不是 5000');
    console.error('3. 接口文件不存在或路径错误');
    console.error('========================================\n');
  }
};

testCronAPI();
