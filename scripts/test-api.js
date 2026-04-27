#!/usr/bin/env node

/**
 * 快速测试脚本：验证 /api/test-welcome-email 接口
 *
 * 运行方式：
 * node scripts/test-api.js
 */

const testAPI = async () => {
  console.log('\n========================================');
  console.log('测试 /api/test-welcome-email 接口');
  console.log('========================================\n');

  const apiUrl = 'http://localhost:5000/api/test-welcome-email';
  const testEmail = 'billycui134@gmail.com';

  console.log('API URL:', apiUrl);
  console.log('测试邮箱:', testEmail);
  console.log('\n发送 POST 请求...\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    console.log('响应状态:', response.status, response.statusText);
    console.log('响应 Headers:');

    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const data = await response.json();
    console.log('\n响应数据:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n========================================');
    if (response.ok) {
      console.log('✅ 测试成功！');
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

testAPI();
