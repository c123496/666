import { TTSProvider, TTSParams, TTSResult, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall } from '@/lib/api-error';

/**
 * 火山引擎语音合成 Provider（待实现）
 *
 * ⚠️ 注意：由于没有官方 API 文档，此 Provider 暂未实现
 * 实现时需要参考以下端点：
 * - 端点：/audio/speech
 * - 方法：POST
 * - 参数：text, voice, response_format, speed
 *
 * 示例实现思路：
 * 1. 映射 speaker 参数到 voice
 * 2. 映射 speechRate 到 speed
 * 3. 返回 { audioUri, audioSize }
 */
export class VolcengineTTSProvider implements TTSProvider {
  readonly type = 'volcengine' as const;
  readonly name = '火山引擎语音合成（待实现）';

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

  async synthesize(params: TTSParams): Promise<TTSResult> {
    throw new ApiError(
      'UNKNOWN',
      '火山引擎语音合成功能暂未实现，请使用 Coze Provider。需要 API 文档才能实现。',
      this.type
    );
  }
}
