/**
 * 火山方舟 Seedream 图片生成 API
 * 官方文档: https://www.volcengine.com/docs/6492/2172373
 */

/**
 * 火山方舟图片生成请求参数
 */
interface VolcengineImageRequest {
  model: string;
  prompt: string;
  size?: string;
  response_format?: 'url' | 'b64_json';
  watermark?: boolean;
  stream?: boolean;
  sequential_image_generation?: string;
}

/**
 * 火山方舟图片生成响应
 */
interface VolcengineImageResponse {
  model: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    size: string;
    error?: {
      code: string;
      message: string;
    };
  }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 为不同角色生成照片提示词
 * 保留原有的角色定制逻辑
 */
export function buildImagePrompt(
  personalityType: string,
  personalityName: string,
  userMessage: string
): string {
  console.log('\n=== buildImagePrompt 被调用 ===');
  console.log('[Prompt] 角色类型:', personalityType);
  console.log('[Prompt] 角色名称:', personalityName);
  console.log('[Prompt] 用户消息:', userMessage);

  // 提取用户的照片要求
  const imageKeywords = {
    // 场景
    selfie: ['自拍', 'selfie', '自拍照'],
    home: ['居家', '在家', '睡衣', '家里', '卧室', '客厅'],
    suit: ['西装', '正装', '工作', '办公室', '商务'],
    casual: ['便装', '休闲', '日常', '私服'],
    night: ['夜晚', '晚上', '睡前', '深夜'],
    morning: ['早上', '清晨', '起床'],
    workout: ['运动', '健身', '锻炼', '跑步'],

    // 表情/动作
    smile: ['微笑', '笑', '开心'],
    serious: ['严肃', '认真', '专注'],
    shy: ['害羞', '脸红'],
    cool: ['帅气', '酷', '有型'],
  };

  // 检测用户要求的场景和风格
  let scene = '日常';
  let style = 'natural';
  let expression = 'gentle';

  const lowerMessage = userMessage.toLowerCase();

  // 检测场景
  if (imageKeywords.selfie.some(k => lowerMessage.includes(k))) scene = '自拍';
  else if (imageKeywords.home.some(k => lowerMessage.includes(k))) scene = '居家';
  else if (imageKeywords.suit.some(k => lowerMessage.includes(k))) scene = '西装正装';
  else if (imageKeywords.casual.some(k => lowerMessage.includes(k))) scene = '休闲私服';
  else if (imageKeywords.night.some(k => lowerMessage.includes(k))) scene = '夜晚';
  else if (imageKeywords.morning.some(k => lowerMessage.includes(k))) scene = '清晨';
  else if (imageKeywords.workout.some(k => lowerMessage.includes(k))) scene = '运动';

  // 检测表情
  if (imageKeywords.smile.some(k => lowerMessage.includes(k))) expression = 'smiling';
  else if (imageKeywords.serious.some(k => lowerMessage.includes(k))) expression = 'serious and focused';
  else if (imageKeywords.shy.some(k => lowerMessage.includes(k))) expression = 'shy';
  else if (imageKeywords.cool.some(k => lowerMessage.includes(k))) style = 'cool and stylish';

  // 根据角色类型定制提示词
  const personalityPrompts: Record<string, string> = {
    ceo: `${scene === '西装正装' ? 'Business elite' : scene === '居家' ? 'Casual home' : scene} style, ${personalityName}, Asian male, 25-30 years old, CEO temperament, wearing ${scene === '西装正装' ? 'tailored suit' : scene === '居家' ? 'casual home clothes' : scene === '自拍' ? 'stylish casual outfit' : 'decent clothes'}, ${expression}, confident and determined eyes, background ${scene === '办公室' ? 'modern office' : scene === '居家' ? 'cozy bedroom' : 'simple and elegant'}, ${style}, realistic photo style, high definition portrait photography`,

    sweet: `${scene} style, ${personalityName}, Asian male, 22-25 years old, gentle and cute boyfriend temperament, wearing ${scene === '居家' ? 'cute home clothes' : scene === '西装正装' ? 'clean suit' : scene === '自拍' ? 'warm casual outfit' : 'fresh clothes'}, ${expression} or gentle smile, warm and clear eyes, background ${scene === '居家' ? 'warm room' : 'bright and warm'}, sunshine healing vibe, ${style}, realistic photo style, high definition portrait photography`,

    actor: `${scene} style, ${personalityName}, Asian male, 24-28 years old, romantic actor temperament, wearing ${scene === '西装正装' ? 'elegant suit' : scene === '居家' ? 'fashionable home clothes' : scene === '自拍' ? 'artistic outfit' : 'stylish clothes'}, ${expression}, charismatic and expressive eyes with storytelling vibe, background ${scene === '夜晚' ? 'romantic night view' : scene === '居家' ? 'artistic space' : 'atmospheric'}, romantic and dramatic feel, ${style}, realistic photo style, high definition portrait photography`,

    striver: `${scene} style, ${personalityName}, Asian male, 23-26 years old, hardworking young man temperament, wearing ${scene === '运动' ? 'sportswear' : scene === '西装正装' ? 'simple suit' : scene === '居家' ? 'comfortable home clothes' : scene === '自拍' ? 'simple casual clothes' : 'clean clothes'}, ${expression} or sincere smile, determined and sincere eyes, background ${scene === '居家' ? 'simple room' : 'lifestyle scene'}, sunshine and sincere vibe, ${style}, realistic photo style, high definition portrait photography`,
  };

  const prompt = personalityPrompts[personalityType] || personalityPrompts.ceo;
  console.log('[Prompt] ✅ 提示词生成完成');
  console.log('[Prompt] 提示词长度:', prompt.length);
  console.log('[Prompt] 提示词预览:', prompt.substring(0, 200) + '...');
  console.log('=== buildImagePrompt 完成 ===\n');

  return prompt;
}

/**
 * 调用火山方舟 Seedream API 生成图片
 * 使用非流式模式，同步返回图片URL
 */
export async function generateImage(
  personalityType: string,
  personalityName: string,
  userMessage: string
): Promise<string> {
  console.log('\n' + '█'.repeat(60));
  console.log('█ 火山方舟图片生成开始执行');
  console.log('█'.repeat(60));

  // 从环境变量读取配置
  const apiKey = process.env.VOLCENGINE_ARK_API_KEY;
  const apiBase = process.env.VOLCENGINE_ARK_BASE_URL || 'https://operator.las.cn-beijing.volces.com';
  const model = process.env.VOLCENGINE_IMAGE_MODEL || 'doubao-seedream-4-5-251128';

  console.log('\n【1. 环境变量检查】');
  console.log('  VOLCENGINE_ARK_API_KEY:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ 未设置');
  console.log('  VOLCENGINE_ARK_BASE_URL:', apiBase);
  console.log('  VOLCENGINE_IMAGE_MODEL:', model);

  if (!apiKey) {
    console.error('\n❌ 错误: VOLCENGINE_ARK_API_KEY 未设置!');
    throw new Error('VOLCENGINE_ARK_API_KEY is not set');
  }

  // 构建提示词
  console.log('\n【2. 构建图片提示词】');
  const prompt = buildImagePrompt(personalityType, personalityName, userMessage);

  try {
    // 调用火山方舟API
    console.log('\n【3. 调用火山方舟图片生成API】');
    const requestBody: VolcengineImageRequest = {
      model,
      prompt,
      size: '2K', // 使用 2K 格式
      response_format: 'url',
      watermark: true, // 添加水印
      stream: false, // 非流式
      sequential_image_generation: 'disabled', // 禁用序列生成
    };

    const apiUrl = `${apiBase}/images/generations`;
    console.log('  请求 URL:', apiUrl);
    console.log('  请求方法: POST');
    console.log('  请求参数:');
    console.log('    - model:', requestBody.model);
    console.log('    - prompt:', requestBody.prompt.substring(0, 100) + '...');
    console.log('    - size:', requestBody.size);
    console.log('    - response_format:', requestBody.response_format);
    console.log('    - watermark:', requestBody.watermark);
    console.log('    - stream:', requestBody.stream);
    console.log('    - sequential_image_generation:', requestBody.sequential_image_generation);

    console.log('\n  正在发送请求到火山方舟...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('  响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n  ❌ 火山方舟API调用失败!');
      console.error('  HTTP状态码:', response.status);
      console.error('  错误详情:', errorText);
      console.error('█'.repeat(60));
      throw new Error(`火山方舟API调用失败: ${response.status} ${errorText}`);
    }

    const data: VolcengineImageResponse = await response.json();
    console.log('\n  ✅ 火山方舟API调用成功!');
    console.log('  模型:', data.model);
    console.log('  创建时间:', new Date(data.created * 1000).toISOString());
    console.log('  生成图片数量:', data.usage.generated_images);
    console.log('  消耗tokens:', data.usage.total_tokens);

    // 提取图片URL
    console.log('\n【4. 提取图片URL】');
    if (!data.data || data.data.length === 0) {
      console.error('  ❌ 没有返回图片数据!');
      console.error('  完整响应:', JSON.stringify(data, null, 2));
      throw new Error('火山方舟API未返回图片数据');
    }

    const firstImage = data.data[0];

    // 检查是否有错误
    if (firstImage.error) {
      console.error('  ❌ 图片生成失败!');
      console.error('  错误码:', firstImage.error.code);
      console.error('  错误信息:', firstImage.error.message);
      throw new Error(`图片生成失败: ${firstImage.error.code} - ${firstImage.error.message}`);
    }

    const imageUrl = firstImage.url;
    if (!imageUrl) {
      console.error('  ❌ 图片URL为空!');
      console.error('  完整数据:', JSON.stringify(firstImage, null, 2));
      throw new Error('火山方舟API未返回图片URL');
    }

    console.log('  ✅ 图片URL提取成功!');
    console.log('  图片URL:', imageUrl);
    console.log('  图片尺寸:', firstImage.size);
    console.log('\n' + '█'.repeat(60));
    console.log('█ 火山方舟图片生成执行完成 ✅');
    console.log('█'.repeat(60) + '\n');

    return imageUrl;

  } catch (error) {
    console.error('\n' + '█'.repeat(60));
    console.error('█ 火山方舟图片生成执行失败 ❌');
    console.error('█'.repeat(60));
    console.error('错误类型:', error instanceof Error ? error.name : typeof error);
    console.error('错误信息:', error instanceof Error ? error.message : String(error));
    console.error('█'.repeat(60) + '\n');
    throw error;
  }
}
