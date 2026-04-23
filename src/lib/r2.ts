import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// 初始化 S3 客户端（指向 R2）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * 上传文件到 Cloudflare R2 对象存储
 * @param fileBuffer 文件的 Buffer 数据
 * @param fileName 文件名（会作为存储的 Key）
 * @param contentType 文件的 MIME 类型
 * @returns 文件的公开访问 URL
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    // 确保环境变量已配置
    if (!process.env.R2_BUCKET_NAME) {
      throw new Error('R2_BUCKET_NAME 环境变量未配置');
    }

    if (!process.env.R2_PUBLIC_URL) {
      throw new Error('R2_PUBLIC_URL 环境变量未配置');
    }

    // 上传文件到 R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    console.log('[R2] 文件上传成功:', fileName);

    // 返回永久的公开链接
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('[R2] 文件上传失败:', error);
    throw new Error('文件上传失败，请稍后重试');
  }
}

/**
 * 生成唯一的文件名（包含时间戳和随机字符串）
 * @param originalFileName 原始文件名
 * @returns 新的文件名
 */
export function generateUniqueFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFileName.split('.').pop();
  const baseName = originalFileName.split('.').slice(0, -1).join('.');

  // 如果有扩展名，返回 baseName-timestamp-random.ext
  // 如果没有扩展名，返回 baseName-timestamp-random
  if (extension) {
    return `${baseName}-${timestamp}-${randomString}.${extension}`;
  } else {
    return `${baseName}-${timestamp}-${randomString}`;
  }
}

/**
 * 清理文件名（移除特殊字符，只保留字母、数字、连字符和点）
 * @param fileName 原始文件名
 * @returns 清理后的文件名
 */
export function sanitizeFileName(fileName: string): string {
  // 移除文件名中的特殊字符，只保留字母、数字、连字符、点和下划线
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}
