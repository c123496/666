import {
  ImageProvider,
  ChatProvider,
  TTSProvider,
  VideoProvider,
  ImageGenerationParams,
  ImageGenerationResult,
  ChatParams,
  ChatStreamChunk,
  TTSParams,
  TTSResult,
  VideoGenerationParams,
  VideoGenerationResult,
} from './types';
import { ApiError } from '@/lib/api-error';
import { VolcengineImageProvider } from './volcengine/image';
import { CozeImageProvider } from './coze/image';
import { TempImageProvider } from './temp/image';
import { logApiCall } from '@/lib/api-error';

// Provider 管理器：自动回退机制
export class ProviderManager {
  private static instance: ProviderManager;

  private imageProviders: ImageProvider[] = [];
  private chatProviders: ChatProvider[] = [];
  private ttsProviders: TTSProvider[] = [];
  private videoProviders: VideoProvider[] = [];

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  private initializeProviders(): void {
    // 图像生成：火山引擎 Seedream 主要方案，Coze 备用，最后临时服务
    this.imageProviders = [
      new VolcengineImageProvider(), // 主要方案：火山方舟 Seedream API
      new CozeImageProvider(),       // 备用方案
      new TempImageProvider(),       // 临时方案：使用免费图片服务（最后备用）
    ];

    // 注意：聊天、TTS、视频暂未实现火山引擎 Provider，只用 Coze
    // 这些需要在获取 API 文档后实现
  }

  // 图像生成（带自动回退）
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    let lastError: any;

    for (const provider of this.imageProviders) {
      if (!provider.isAvailable()) {
        console.log(`[ProviderManager] ${provider.name} 不可用，跳过`);
        continue;
      }

      try {
        console.log(`[ProviderManager] 尝试使用 ${provider.name} 生成图像`);

        const result = await provider.generateImage(params);

        logApiCall({
          provider: provider.type,
          endpoint: 'image/generate',
          method: 'POST',
          startTime,
          success: true,
        });

        console.log(`[ProviderManager] ${provider.name} 生成图像成功`);
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`[ProviderManager] ${provider.name} 生成图像失败:`, error.message);

        // 如果是 401/403 错误，不要重试（配置问题）
        if (error instanceof ApiError && (error.code === '401' || error.code === '403')) {
          continue;
        }

        // 其他错误，尝试下一个 provider
        continue;
      }
    }

    // 所有 provider 都失败
    console.error('[ProviderManager] 所有图像生成 Provider 都失败');
    throw lastError || new ApiError('UNKNOWN', '所有图像生成服务都不可用', 'manager');
  }

  // 获取当前使用的图像 Provider（用于测试）
  getCurrentImageProvider(): ImageProvider | null {
    for (const provider of this.imageProviders) {
      if (provider.isAvailable()) {
        return provider;
      }
    }
    return null;
  }

  // 占位方法：聊天（暂未实现回退，只用 Coze）
  async streamChat(params: ChatParams): Promise<AsyncIterable<ChatStreamChunk>> {
    throw new Error('聊天功能暂未实现 Provider 回退，请继续使用 Coze SDK');
  }

  // 占位方法：TTS（暂未实现回退，只用 Coze）
  async synthesize(params: TTSParams): Promise<TTSResult> {
    throw new Error('语音合成功能暂未实现 Provider 回退，请继续使用 Coze SDK');
  }

  // 占位方法：视频（暂未实现回退，只用 Coze）
  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    throw new Error('视频生成功能暂未实现 Provider 回退，请继续使用 Coze SDK');
  }
}

// 导出单例
export const providerManager = ProviderManager.getInstance();
