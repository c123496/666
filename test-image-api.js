// 测试火山引擎API配置
const VOLCENGINE_API_KEY = "your-volcengine-api-key-here"; // 请在 .env.local 中配置真实 key
const VOLCENGINE_API_BASE = "https://ark.cn-beijing.volces.com/api/v3";

async function testVolcengineAPI() {
  console.log('=== 测试火山引擎API ===');
  console.log('API Key:', VOLCENGINE_API_KEY ? '已配置' : '未配置');
  console.log('API Base:', VOLCENGINE_API_BASE);

  try {
    const url = `${VOLCENGINE_API_BASE}/images/generations`;
    console.log('请求URL:', url);

    const body = {
      model: 'doubao-seedream-5-0-260128',
      prompt: '测试图片生成',
      size: '1920x1920',
      watermark: false,
      response_format: 'url',
      stream: false,
      sequential_image_generation: 'disabled',
    };

    console.log('请求体:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLCENGINE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 在浏览器控制台中运行测试
console.log('请在浏览器控制台中运行以下代码测试:');
console.log(`
fetch('/api/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '测试图片生成',
    personalityId: 'ceo'
  })
}).then(r => r.json()).then(data => console.log('图片生成结果:', data));
`);

export {};
