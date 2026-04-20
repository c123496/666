import { ImageProvider, ImageGenerationParams, ImageGenerationResult, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall } from '@/lib/api-error';

/**
 * 临时图片生成 Provider
 * 使用免费的图片服务作为占位符，直到真实的 API 配置完成
 */
export class TempImageProvider implements ImageProvider {
  readonly type = 'temp' as const;
  readonly name = '临时图片服务';

  private config: ProviderConfig;

  constructor(config?: ProviderConfig) {
    this.config = config || {
      apiKey: 'temp',
      baseURL: 'https://picsum.photos',
    };
  }

  isAvailable(): boolean {
    return true; // 总是可用
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`[TempImageProvider] 生成占位图片:`, params.prompt);

      // 使用多种免费图片服务
      const imageServices = [
        // Picsum Photos - 随机高质量图片
        `https://picsum.photos/1024/1024?random=${Date.now()}`,

        // Unsplash Source - 基于关键词的图片
        `https://source.unsplash.com/1024x1024/?${encodeURIComponent(params.prompt.substring(0, 30))}&sig=${Date.now()}`,

        // Lorem Picsum - 另一个随机图片服务
        `https://loremflickr.com/1024/1024?random=${Date.now()}`,

        // 备用：使用固定的高质量图片URL
        `https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1024&h=1024&fit=crop`,
      ];

      // 随机选择一个服务
      const imageUrl = imageServices[Math.floor(Math.random() * imageServices.length)];

      console.log(`[TempImageProvider] 使用图片URL:`, imageUrl);

      logApiCall({
        provider: this.type,
        endpoint: 'image/generate',
        method: 'POST',
        startTime,
        success: true,
        duration: Date.now() - startTime,
      });

      return {
        success: true,
        imageUrl: imageUrl,
      };
    } catch (error: any) {
      const code = getErrorCode(error, this.type);
      const message = getErrorMessage(code, this.type);

      logApiCall({
        provider: this.type,
        endpoint: 'image/generate',
        method: 'POST',
        startTime,
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      });

      throw new ApiError(code, message, this.type, error, error.statusCode);
    }
  }
}
