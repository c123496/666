import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers';
import { ImageRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-error';
import { uploadToR2 } from '@/lib/r2';
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
    console.log('[Image API] 豆包返回临时图片 URL:', tempImageUrl);

    let imageBuffer: Buffer;
    let contentType = 'image/jpeg';

    try {
      const imageResponse = await fetch(tempImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText} (${imageResponse.status})`);
      }

      // 检测 Content-Type
      const responseContentType = imageResponse.headers.get('content-type');
      if (responseContentType) {
        contentType = responseContentType;
        console.log('[Image API] 检测到图片类型:', contentType);
      }

      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      console.log('[Image API] 图片下载成功，大小:', imageBuffer.length, 'bytes');
    } catch (error) {
      console.error('[Image API] 下载豆包图片失败:', error);
      return NextResponse.json(
        { error: '下载图片失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 3. 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `generated-images/${user.id}/${timestamp}-${random}.${fileExtension}`;

    console.log('[Image API] 准备上传到 R2，文件名:', fileName);

    // 4. 上传到 R2，获取永久链接
    let permanentUrl: string;
    try {
      permanentUrl = await uploadToR2(imageBuffer, fileName, contentType);
      console.log('[Image API] ✅ 图片已上传到 R2:', permanentUrl);
    } catch (error) {
      console.error('[Image API] ❌ 上传 R2 失败:', error);
      return NextResponse.json(
        { error: '图片上传失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 5. 保存记录到数据库
    try {
      await db.insert(generatedImages).values({
        userId: user.id,
        imageUrl: permanentUrl,
        prompt: prompt,
        createdAt: new Date(),
      });
      console.log('[Image API] ✅ 图片记录已保存到数据库，ID:', user.id);
    } catch (error) {
      console.error('[Image API] ❌ 数据库保存失败:', error);
      return NextResponse.json(
        { error: '保存图片记录失败，请稍后重试' },
        { status: 500 }
      );
    }

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
