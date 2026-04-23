import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers';
import { ImageRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-error';
import { uploadToR2 } from '@/lib/r2';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { generatedImages } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImageRequest = await request.json();
    const { prompt, personalityId } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // 1. 使用 Provider 管理器生成图像（自动回退）
    const result = await providerManager.generateImage({
      prompt,
      size: '2K',
      watermark: false,
    });

    if (!result.success || !result.imageUrl) {
      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
      );
    }

    // 2. 下载临时图片
    const tempImageUrl = result.imageUrl;
    console.log('[Image API] 下载临时图片:', tempImageUrl);

    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // 3. 生成唯一文件名
    const fileName = `images/${nanoid()}.png`;

    // 4. 上传到 R2，获取永久链接
    const permanentUrl = await uploadToR2(imageBuffer, fileName, 'image/png');
    console.log('[Image API] 图片已上传到 R2:', permanentUrl);

    // 5. 保存记录到数据库
    await db.insert(generatedImages).values({
      userId: user.id,
      imageUrl: permanentUrl,
      prompt: prompt,
      createdAt: new Date(),
    });
    console.log('[Image API] 图片记录已保存到数据库');

    // 6. 返回永久链接给前端
    return NextResponse.json({
      success: true,
      imageUrl: permanentUrl,
    });
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
