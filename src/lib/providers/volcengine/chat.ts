import { ChatProvider, ChatParams, ChatStreamChunk, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall } from '@/lib/api-error';

/**
 * 火山引擎聊天 Provider（待实现）
 *
 * ⚠️ 注意：由于没有官方 API 文档，此 Provider 暂未实现
 * 实现时需要参考以下端点：
 * - 端点：/chat/completions
 * - 方法：POST
 * - 格式：OpenAI 兼容（流式 SSE）
 *
 * 示例实现思路：
 * 1. 构建请求体 { messages, model, stream: true, temperature }
 * 2. 处理 SSE 流式响应
 * 3. 逐块返回 { content, done }
 */
export class VolcengineChatProvider implements ChatProvider {
  readonly type = 'volcengine' as const;
  readonly name = '火山引擎聊天（待实现）';

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

  async *streamChat(params: ChatParams): AsyncIterable<ChatStreamChunk> {
    throw new ApiError(
      'UNKNOWN',
      '火山引擎聊天功能暂未实现，请使用 Coze Provider。需要 API 文档才能实现。',
      this.type
    );
  }
}
