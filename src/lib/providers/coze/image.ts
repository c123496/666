import { ImageProvider, ImageGenerationParams, ImageGenerationResult } from '../types';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { ApiError, getErrorCode, getErrorMessage, logApiCall } from '@/lib/api-error';

export class CozeImageProvider implements ImageProvider {
  readonly type = 'coze' as const;
  readonly name = 'Coze 图像生成';

  private config: Config;

  constructor() {
    this.config = new Config();
  }

  isAvailable(): boolean {
    // Coze SDK 总是可用的（使用默认配置）
    return true;
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      // 创建客户端（从请求头中提取自定义头部）
      // 注意：这里无法直接访问 request.headers，需要在调用时传入
      const customHeaders = {};

      const client = new ImageGenerationClient(this.config, customHeaders);

      // 构建增强的提示词
      const enhancedPrompt = `${params.prompt}, 漫画风格, 温馨浪漫氛围, 高质量插画`;

      // 调用 API
      const response = await client.generate({
        prompt: enhancedPrompt,
        size: params.size || '2K',
        watermark: params.watermark ?? false,
      });

      const helper = client.getResponseHelper(response);

      if (helper.success && helper.imageUrls.length > 0) {
        logApiCall({
          provider: this.type,
          endpoint: 'image/generate',
          method: 'POST',
          startTime,
          success: true,
        });

        return {
          success: true,
          imageUrl: helper.imageUrls[0],
        };
      } else {
        const errorMsg = helper.errorMessages.join(', ') || 'Image generation failed';

        logApiCall({
          provider: this.type,
          endpoint: 'image/generate',
          method: 'POST',
          startTime,
          success: false,
          error: errorMsg,
        });

        throw new ApiError('UNKNOWN', errorMsg, this.type);
      }
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
      });

      throw new ApiError(code, message, this.type, error);
    }
  }
}
