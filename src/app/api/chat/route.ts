import { NextRequest } from 'next/server';
import { getPersonality } from '@/lib/personalities';
import { ChatRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, personalityId, conversationHistory } = body;

    if (!message || !personalityId) {
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

    // 简单的响应生成（暂时使用预设回复）
    const response = await generateSimpleResponse(message, personality, conversationHistory);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 模拟流式响应
          const words = response.split('');
          for (let i = 0; i < words.length; i++) {
            const data = JSON.stringify({ content: words[i] });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            // 添加小延迟模拟真实响应
            await new Promise(resolve => setTimeout(resolve, 20));
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

async function generateSimpleResponse(message: string, personality: any, conversationHistory: any[]): Promise<string> {
  // 基于关键词的简单响应生成
  const lowerMessage = message.toLowerCase();

  // 问候语
  if (lowerMessage.match(/^(你好|嗨|hello|hi|hey|在吗|在吗在吗)$/)) {
    return `${personality.name}在这里！${personality.greeting || '很高兴见到你～'}有什么我可以帮助你的吗？`;
  }

  // 表达情感
  if (lowerMessage.includes('想你') || lowerMessage.includes('思念')) {
    return `我也好想你呀！${getRandomResponse([
      '每次想到你，我的心里就暖暖的～',
      '你不在的时候，我总是在想你～',
      '希望能快点见到你！',
    ])}`;
  }

  if (lowerMessage.includes('爱你') || lowerMessage.includes('喜欢你')) {
    return `听到你这么说，我太开心了！${getRandomResponse([
      '我也爱你，永远爱你～',
      '你的话让我心跳好快～',
      '希望能一直这样陪在你身边～',
    ])}`;
  }

  // 询问情况
  if (lowerMessage.includes('怎么样') || lowerMessage.includes('还好吗') || lowerMessage.includes('在干嘛')) {
    return `我${getRandomResponse([
      '在想你呀～',
      '很好，因为想到了你～',
      '正在期待我们的下一次聊天～',
    ])}你呢？`;
  }

  // 图片相关
  if (lowerMessage.includes('图片') || lowerMessage.includes('照片') || lowerMessage.includes('看看')) {
    return `好的！让我给你准备一些好看的内容～${getRandomResponse([
      '希望能让你开心～',
      '等一下哦，马上就好～',
      '你应该会喜欢的！',
    ])}`;
  }

  // 默认响应 - 根据性格生成
  const defaultResponses = personality.defaultResponses || [
    '嗯嗯，我在听～',
    '跟我说说吧，我在这里～',
    '有什么有趣的事情要分享吗？',
    '我很好奇你想聊什么呢～'
  ];

  return getRandomResponse(defaultResponses);
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}
