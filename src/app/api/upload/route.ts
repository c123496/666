import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateUniqueFileName, sanitizeFileName } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（例如限制为 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    // 验证文件类型（只允许图片）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '只支持 JPG、PNG、GIF、WebP 格式的图片' },
        { status: 400 }
      );
    }

    // 清理文件名并生成唯一文件名
    const sanitizedName = sanitizeFileName(file.name);
    const uniqueFileName = generateUniqueFileName(sanitizedName);

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到 R2
    const publicUrl = await uploadToR2(buffer, uniqueFileName, file.type);

    console.log('[上传] 文件上传成功:', {
      原文件名: file.name,
      存储文件名: uniqueFileName,
      公开URL: publicUrl,
      文件大小: file.size,
      文件类型: file.type,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('[上传] 文件上传失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文件上传失败' },
      { status: 500 }
    );
  }
}
