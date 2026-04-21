import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getPersonality } from '@/lib/personalities';
import { generateText } from '@/lib/gemini';
import { shouldGenerateImage, detectImageIntent } from '@/lib/intent-detector';
import { generateImage } from '@/lib/image-gen';
import { ChatRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 获取用户信息并构建上下文提示
 */
async function getUserContext(userId?: string): Promise<string> {
  if (!userId) return '';

  try {
    // 从 session cookie 获取用户信息
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.get('session')?.value;
    if (!cookieHeader) return '';

    // 这里可以解析用户信息，暂时返回空
    // 实际项目中可以从数据库获取用户昵称、关系状态等
    return '';
  } catch (error) {
    console.error('获取用户上下文失败:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  console.log('\n' + '█'.repeat(60));
  console.log('█ API: /api/chat 被调用');
  console.log('█'.repeat(60));

  try {
    const body: ChatRequest = await request.json();
    const { message, personalityId, conversationHistory, userId } = body;

    console.log('\n【请求参数】');
    console.log('  message:', message);
    console.log('  personalityId:', personalityId);
    console.log('  conversationHistory length:', conversationHistory?.length || 0);
    console.log('  userId:', userId || '(none)');

    if (!message || !personalityId) {
      console.log('  ❌ 缺少必要参数');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const personality = getPersonality(personalityId);
    if (!personality) {
      return new Response(JSON.stringify({ error: 'Invalid personality' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('收到聊天请求:', {
      personalityId,
      message,
      conversationHistory: conversationHistory?.length,
    });

    // 检测图片生成意图
    const imageIntent = detectImageIntent(message);
    const shouldGenImage = imageIntent.isStrongTrigger || (imageIntent.matches && imageIntent.confidence >= 0.5);

    console.log('\n' + '='.repeat(60));
    console.log('【图片意图检测结果】');
    console.log('='.repeat(60));
    console.log('  用户消息:', message);
    console.log('  是否命中强触发词:', imageIntent.isStrongTrigger ? '✅ 是' : '❌ 否');
    if (imageIntent.isStrongTrigger) {
      console.log('  命中的强触发词:', imageIntent.detectedKeywords.join(', '));
      console.log('  ⚡⚡⚡ 强触发词直接进入图片分支 ⚡⚡⚡');
    } else {
      console.log('  是否匹配:', imageIntent.matches);
      console.log('  置信度:', imageIntent.confidence);
      console.log('  触发关键词:', imageIntent.detectedKeywords);
    }
    console.log('  是否生成图片:', shouldGenImage ? '✅ 是' : '❌ 否');
    console.log('  shouldGenImage 变量值:', shouldGenImage);
    console.log('  当前角色:', personalityId, personality.name);
    console.log('='.repeat(60));

    let imageUrl: string | null = null;
    let imageError: string | null = null;

    // 如果需要生成图片（异步任务模式 - 等待完成）
    console.log('\n[DEBUG] 准备进入 if (shouldGenImage) 判断');
    console.log('[DEBUG] shouldGenImage 的值是:', shouldGenImage, '类型:', typeof shouldGenImage);

    if (shouldGenImage) {
      console.log('\n' + '▓'.repeat(60));
      console.log('▓ ✅✅✅ 进入图片生成分支 ✅✅✅');
      console.log('▓'.repeat(60));
      console.log('  角色类型:', personalityId);
      console.log('  角色名称:', personality.name);
      console.log('  用户消息:', message);
      console.log('  ⏱️  预计需要 10-60 秒，请耐心等待...');

      try {
        imageUrl = await generateImage(personalityId, personality.name, message);

        console.log('\n▓'.repeat(60));
        console.log('▓ 图片生成成功 ✅');
        console.log('▓'.repeat(60));
        console.log('  图片URL:', imageUrl);
      } catch (error) {
        console.log('\n' + '▓'.repeat(60));
        console.log('▓ 图片生成失败 ❌');
        console.log('▓'.repeat(60));
        imageError = error instanceof Error ? error.message : 'Unknown error';
        console.error('  失败原因:', imageError);
        console.log('  ⚠️  将继续生成文字回复，并在末尾添加提示');
      }
    } else {
      console.log('\n' + '▓'.repeat(60));
      console.log('▓ ❌❌❌ 未进入图片生成分支 ❌❌❌');
      console.log('▓'.repeat(60));
      console.log('  原因: shouldGenImage =', shouldGenImage);
      console.log('  matches =', imageIntent.matches);
      console.log('  confidence =', imageIntent.confidence);
      console.log('  将进入文本分支，调用 Gemini API');
    }

    // 获取用户上下文
    const userContext = await getUserContext(userId);

    console.log('\n' + '◆'.repeat(60));
    console.log('◆ 准备调用 Gemini API 生成文字回复');
    console.log('◆'.repeat(60));
    console.log('  imageUrl:', imageUrl || '(无)');
    console.log('  imageError:', imageError || '(无)');
    console.log('  将构建消息历史并发送给 Gemini...');
    console.log('◆'.repeat(60));

    // 构建增强的系统提示
    let enhancedSystemPrompt = personality.systemPrompt;

    // 如果有用户上下文，添加到系统提示中
    if (userContext) {
      enhancedSystemPrompt += `\n\n【用户信息】\n${userContext}`;
    }

    // 构建消息历史（确保有足够的上下文）
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // 添加角色设定
    messages.push({
      role: 'assistant',
      content: enhancedSystemPrompt,
    });

    // 添加对话历史（最近10轮）
    if (conversationHistory && conversationHistory.length > 0) {
      // 取最近10轮对话（20条消息）
      const recentHistory = conversationHistory.slice(-20);
      messages.push(...recentHistory);
    }

    // 添加当前用户消息
    // 如果图片生成失败，修改用户消息以避免 Gemini "假装发照片"
    let finalUserMessage = message;
    if (imageError && shouldGenImage) {
      finalUserMessage = `[系统提示：图片生成失败：${imageError}] 用户原始消息：${message}`;
    }

    messages.push({
      role: 'user',
      content: finalUserMessage,
    });

    // 调用 Gemini API 生成响应
    const response = await generateText(messages, personality.prompt || '');

    console.log('生成的响应长度:', response.length);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 先发送图片URL（如果有）
          if (imageUrl) {
            const imageData = JSON.stringify({
              type: 'image',
              imageUrl: imageUrl,
            });
            controller.enqueue(encoder.encode(`data: ${imageData}\n\n`));
          }

          // 模拟流式输出 - 逐字发送
          const words = response.split('');
          for (let i = 0; i < words.length; i++) {
            const data = JSON.stringify({
              type: 'text',
              content: words[i],
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            // 添加小延迟模拟真实响应速度
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          // 如果有图片错误，发送错误提示
          if (imageError) {
            const errorMsg = JSON.stringify({
              type: 'text',
              content: `\n\n（这次照片没发成功，再让我给你补一张💕）`,
            });
            controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
          }

          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
