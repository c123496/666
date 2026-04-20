import { VideoProvider, VideoGenerationParams, VideoGenerationResult, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall } from '@/lib/api-error';

/**
 * 火山引擎视频生成 Provider（待实现）
 *
 * ⚠️ 注意：由于没有官方 API 文档，此 Provider 暂未实现
 * 实现时可能需要参考以下端点：
 * - 端点：/videos/generations
 * - 方法：POST
 * - 参数：prompt, model, duration, ratio, resolution, watermark
 *
 * 注意：视频生成可能需要较长时间（几分钟），需要：
 * 1. 支持异步轮询
 * 2. 设置较长超时时间（如 15 分钟）
 * 3. 处理队列状态
 */
export class VolcengineVideoProvider implements VideoProvider {
  readonly type = 'volcengine' as const;
  readonly name = '火山引擎视频生成（待实现）';

  private config: ProviderConfig;

  constructor(config?: ProviderConfig) {
    this.config = config || {
      apiKey: process.env.VOLCENGINE_API_KEY || '',
      baseURL: process.env.VOLCENGINE_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3',
    };
  }

  isAvailable(): boolean {
    // 暂未实现，返回 false
    return false;
  }

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    throw new ApiError(
      'UNKNOWN',
      '火山引擎视频生成功能暂未实现，请使用 Coze Provider。需要 API 文档才能实现。',
      this.type
    );
  }
}
