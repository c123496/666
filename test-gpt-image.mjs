// 测试 GPT-Image API 集成
const API_BASE = 'https://api.keysk.com/v1';
const API_KEY = 'keysk-vrjcNmf1GVXUUZ0RCrOhybj0bs7nqiT468qZQdmGEaQbtSVN';

async function testGPTImageAPI() {
  console.log('开始测试 GPT-Image API...');

  try {
    // 1. 发起图像生成请求
    console.log('\n1. 发起图像生成请求...');
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1.5',
        prompt: '温馨浪漫的场景，适合情侣',
        size: '1024x1024',
        quality: 'high',
        n: 1,
      }),
    });

    console.log('响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('请求失败:', errorText);
      return;
    }

    const data = await response.json();
    console.log('API 响应:', JSON.stringify(data, null, 2));

    // 2. 检查任务状态
    if (data.status === 'pending' || data.status === 'processing') {
      console.log('\n2. 任务需要轮询，开始轮询...');
      const result = await pollForResult(data.id);
      console.log('\n✅ 最终结果:', result);
    } else if (data.status === 'succeeded' && data.result?.url) {
      console.log('\n✅ 图像生成成功!');
      console.log('图片 URL:', data.result.url);
    } else {
      console.log('\n❌ 意外的状态:', data.status);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

async function pollForResult(taskId) {
  const maxAttempts = 30; // 减少到30次用于测试
  const pollInterval = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`轮询 (${attempt + 1}/${maxAttempts})...`);

      const response = await fetch(`${API_BASE}/images/generations/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      const data = await response.json();
      console.log(`状态: ${data.status}${data.progress ? ` (${data.progress}%)` : ''}`);

      if (data.status === 'succeeded' && data.result?.url) {
        return { success: true, imageUrl: data.result.url };
      } else if (data.status === 'failed') {
        return { success: false, error: '任务失败' };
      } else if (data.status === 'cancelled') {
        return { success: false, error: '任务被取消' };
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`轮询错误:`, error.message);
      if (attempt === maxAttempts - 1) {
        return { success: false, error: '轮询超时' };
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  return { success: false, error: '轮询超时' };
}

// 运行测试
testGPTImageAPI().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试异常:', error);
});
