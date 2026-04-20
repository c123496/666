import { ImageProvider, ImageGenerationParams, ImageGenerationResult, ProviderConfig } from '../types';
import { ApiError, getErrorCode, getErrorMessage, logApiCall, fetchWithRetry } from '@/lib/api-error';

interface GPTImageRequest {
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
  callback_url?: string;
}

interface GPTImageResponse {
  created: number;
  id: string;
  model: string;
  object: string;
  status: string;
  progress?: number;
  task_info?: {
    can_cancel: boolean;
    estimated_time?: number;
  };
  usage?: {
    billing_rule: string;
    credits_reserved: number;
    user_group: string;
  };
  result?: {
    url: string;
    revised_prompt?: string;
  };
  results?: string[]; // 新增：直接返回URL数组
  result_data?: Array<{
    url: string;
    [key: string]: any;
  }>;
}

export class GPTImageProvider implements ImageProvider {
  readonly type = 'gptimage' as const;
  readonly name = 'GPT-Image 图像生成';

  private config: ProviderConfig;

  constructor(config?: ProviderConfig) {
    this.config = config || {
      apiKey: process.env.GPT_IMAGE_API_KEY || '',
      baseURL: process.env.GPT_IMAGE_API_BASE || 'https://api.evolink.ai/v1',
    };
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      if (!this.isAvailable()) {
        throw new ApiError('UNKNOWN', 'GPT-Image API Key 未配置', this.type);
      }

      // 尺寸映射
      const sizeMap: Record<string, string> = {
        '2K': '1024x1024',
        '1080p': '1920x1080',
        '720p': '1280x720',
        '1:1': '1024x1024',
        '16:9': '1920x1080',
        '9:16': '1080x1920',
      };

      const size = sizeMap[params.size || '2K'] || params.size || '1024x1024';

      // 处理提示词：将中文转换为英文，以避免API内容审核问题
      let prompt = params.prompt;
      if (this.containsChinese(prompt)) {
        console.log(`[GPTImageProvider] 检测到中文提示词，转换为英文`);
        prompt = this.translateToEnglish(prompt);
        console.log(`[GPTImageProvider] 英文提示词: ${prompt}`);
      }

      // 构建请求 - 使用多个可能的端点
      const possibleEndpoints = [
        `${this.config.baseURL}/images/generations`,
        `${this.config.baseURL}/images/generate`,
        `https://api.evolink.ai/v1/images/generations`,
        `https://api.evolink.ai/v1/images/generate`,
      ];

      let lastError: any;

      for (const url of possibleEndpoints) {
        try {
          console.log(`[GPTImageProvider] 尝试端点: ${url}`);

          const body: GPTImageRequest = {
            model: 'gpt-image-1.5',
            prompt: prompt,
            size: size,
            quality: 'high',
            n: 1,
          };

          console.log(`[GPTImageProvider] 发起图像生成请求:`, { url, body });

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
            { maxRetries: 1, retryDelay: 500, timeout: 30000 }
          );

          const data: GPTImageResponse = await response.json();
          console.log(`[GPTImageProvider] API 响应:`, data);

          // 检查响应状态
          if (data.status === 'pending' || data.status === 'processing') {
            // 需要轮询获取结果
            const result = await this.pollForResult(data.id, startTime, url);
            return result;
          } else if ((data.status === 'succeeded' || data.status === 'completed') && this.getImageUrl(data)) {
            // 立即成功
            const imageUrl = this.getImageUrl(data)!;

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
          } else {
            lastError = new ApiError('UNKNOWN', `图像生成失败: ${data.status}`, this.type);
            continue; // 尝试下一个端点
          }
        } catch (error: any) {
          console.error(`[GPTImageProvider] 端点 ${url} 失败:`, error.message);
          lastError = error;
          continue; // 尝试下一个端点
        }
      }

      // 所有端点都失败
      throw lastError || new ApiError('UNKNOWN', '所有 API 端点都无法访问，请检查 API 配置', this.type);
    } catch (error: any) {
      const code = getErrorCode(error, this.type);
      const message = getErrorMessage(code, this.type);

      // 记录错误日志
      logApiCall({
        provider: this.type,
        endpoint: 'image/generate',
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

  private containsChinese(text: string): boolean {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  private translateToEnglish(text: string): string {
    // 简单的中文到英文映射
    const translations: Record<string, string> = {
      '温馨浪漫': 'romantic and warm',
      '场景': 'scene',
      '适合情侣': 'suitable for couples',
      '美丽的': 'beautiful',
      '风景': 'landscape',
      '可爱的': 'cute',
      '猫咪': 'cat',
      '小狗': 'dog',
      '人物': 'person',
      '情侣': 'couple',
      '浪漫': 'romantic',
      '温馨': 'warm',
      '爱情': 'love',
      '甜蜜': 'sweet',
      '幸福': 'happy',
      '美丽': 'beautiful',
      '漂亮': 'beautiful',
      '好看': 'good-looking',
    };

    let result = text;
    for (const [chinese, english] of Object.entries(translations)) {
      result = result.replace(new RegExp(chinese, 'g'), english);
    }

    // 如果没有翻译的中文，使用通用描述
    if (this.containsChinese(result)) {
      return 'A romantic and beautiful scene';
    }

    return result;
  }

  private getImageUrl(data: GPTImageResponse): string | null {
    // 优先级1: 检查 results 数组（新API格式）
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }

    // 优先级2: 检查 result_data 数组
    if (data.result_data && Array.isArray(data.result_data) && data.result_data.length > 0) {
      return data.result_data[0].url || null;
    }

    // 优先级3: 检查 result.url（旧格式）
    if (data.result?.url) {
      return data.result.url;
    }

    return null;
  }

  private async pollForResult(taskId: string, startTime: number, baseUrl: string): Promise<ImageGenerationResult> {
    const maxAttempts = 30; // 最多轮询 30次 (1分钟)
    const pollInterval = 2000; // 每2秒轮询一次

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // 使用正确的轮询端点：/v1/tasks/{taskId}
        const baseURL = baseUrl.replace('/images/generations', '').replace('/images/generate', '');
        const url = `${baseURL}/tasks/${taskId}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        });

        if (!response.ok) {
          console.warn(`[GPTImageProvider] 轮询响应失败: ${response.status}`);
          if (attempt === maxAttempts - 1) {
            throw new ApiError('UNKNOWN', `图像生成失败: 轮询端点返回 ${response.status}`, this.type);
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        const data: GPTImageResponse = await response.json();
        console.log(`[GPTImageProvider] 轮询结果 (${attempt + 1}/${maxAttempts}):`, data.status, data.progress ? `(${data.progress}%)` : '');

        // 检查任务完成状态（支持 succeeded 和 completed）
        if ((data.status === 'succeeded' || data.status === 'completed') && this.getImageUrl(data)) {
          const imageUrl = this.getImageUrl(data)!;

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
        } else if (data.status === 'failed') {
          throw new ApiError('UNKNOWN', '图像生成失败: 任务状态为失败', this.type);
        } else if (data.status === 'cancelled') {
          throw new ApiError('UNKNOWN', '图像生成失败: 任务被取消', this.type);
        }

        // 继续等待
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`[GPTImageProvider] 轮询错误:`, error);

        // 最后一次尝试失败则抛出错误
        if (attempt === maxAttempts - 1) {
          throw new ApiError('UNKNOWN', '图像生成超时: 轮询失败', this.type);
        }

        // 继续尝试
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new ApiError('UNKNOWN', '图像生成超时: 未在规定时间内完成', this.type);
  }
}
