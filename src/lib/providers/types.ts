// Provider 类型定义
export type ProviderType = 'volcengine' | 'coze' | 'gptimage' | 'temp';

// 消息类型
export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 图像生成参数
export interface ImageGenerationParams {
  prompt: string;
  size?: string;
  watermark?: boolean;
}

// 图像生成结果
export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// 聊天参数
export interface ChatParams {
  messages: ProviderMessage[];
  model?: string;
  temperature?: number;
}

// 聊天流式结果
export interface ChatStreamChunk {
  content: string;
  done?: boolean;
}

// TTS 参数
export interface TTSParams {
  text: string;
  speaker: string;
  speechRate?: number;
  audioFormat?: string;
}

// TTS 结果
export interface TTSResult {
  audioUri: string;
  audioSize: number;
}

// 视频生成参数
export interface VideoGenerationParams {
  prompt: string;
  model?: string;
  duration?: number;
  ratio?: string;
  resolution?: string;
  watermark?: boolean;
}

// 视频生成结果
export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

// Provider 基础接口
export interface BaseProvider {
  readonly type: ProviderType;
  readonly name: string;
  isAvailable(): boolean;
}

// 图像生成 Provider 接口
export interface ImageProvider extends BaseProvider {
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}

// 聊天 Provider 接口
export interface ChatProvider extends BaseProvider {
  streamChat(params: ChatParams): AsyncIterable<ChatStreamChunk>;
}

// TTS Provider 接口
export interface TTSProvider extends BaseProvider {
  synthesize(params: TTSParams): Promise<TTSResult>;
}

// 视频生成 Provider 接口
export interface VideoProvider extends BaseProvider {
  generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult>;
}

// Provider 配置
export interface ProviderConfig {
  apiKey: string;
  baseURL: string;
}
