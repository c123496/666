import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers';
import { ImageRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { prompt, personalityId } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // 使用 Provider 管理器生成图像（自动回退）
    const result = await providerManager.generateImage({
      prompt,
      size: '2K',
      watermark: false,
    });

    if (result.success && result.imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Image API] Error:', error);

    // 提取友好的错误消息
    const errorMessage = error instanceof ApiError
      ? error.message
      : (error instanceof Error ? error.message : 'Internal server error');

    // 确定状态码
    const statusCode = error instanceof ApiError
      ? (error.code === '401' || error.code === '403' ? 401 : 500)
      : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
