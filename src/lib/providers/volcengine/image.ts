import { ImageProvider, ImageGenerationParams, ImageGenerationResult, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall, fetchWithRetry } from '@/lib/api-error';

// 尺寸映射
const SIZE_MAP: Record<string, string> = {
  '2K': '1920x1920',
  '1080p': '1920x1080',
  '720p': '1280x720',
  '1:1': '1024x1024',
  '16:9': '1920x1080',
  '9:16': '1080x1920',
};

export class VolcengineImageProvider implements ImageProvider {
  readonly type = 'volcengine' as const;
  readonly name = '火山引擎图像生成';

  private config: ProviderConfig;

  constructor(config?: ProviderConfig) {
    this.config = config || {
      apiKey: process.env.VOLCENGINE_API_KEY || '',
      baseURL: process.env.VOLCENGINE_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3',
    };
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      if (!this.isAvailable()) {
        throw new ApiError('UNKNOWN', '火山引擎 API Key 未配置', this.type);
      }

      // 映射尺寸
      const size = SIZE_MAP[params.size || '2K'] || params.size || '1920x1920';

      // 构建请求
      const url = `${this.config.baseURL}/images/generations`;
      const body = {
        model: 'doubao-seedream-5-0-260128',
        prompt: params.prompt,
        size,
        watermark: params.watermark ?? false,
        response_format: 'url',
        stream: false,
        sequential_image_generation: 'disabled',
      };

      // 调用 API
      const response = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        {
          provider: this.type,
          endpoint: '/images/generations',
          method: 'POST',
          startTime,
        },
        { maxRetries: 2, retryDelay: 1000, timeout: 60000 }
      );

      const data = await response.json();

      // 验证响应
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new ApiError('UNKNOWN', '图像生成失败：未返回有效数据', this.type);
      }

      const imageUrl = data.data[0].url;
      if (!imageUrl) {
        throw new ApiError('UNKNOWN', '图像生成失败：未返回图片 URL', this.type);
      }

      return {
        success: true,
        imageUrl,
      };
    } catch (error: any) {
      const code = getErrorCode(error, this.type);
      const message = getErrorMessage(code, this.type);

      // 记录错误日志
      logApiCall({
        provider: this.type,
        endpoint: '/images/generations',
        method: 'POST',
        startTime,
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      });

      // 抛出格式化的错误
      throw new ApiError(code, message, this.type, error, error.statusCode);
    }
  }
}
