// 男友人设类型
export type PersonalityType = 'ceo' | 'sweet' | 'actor' | 'striver';

// 消息类型
export type MessageType = 'text' | 'voice' | 'image' | 'video';

// 消息状态
export type MessageStatus = 'pending' | 'sent' | 'failed';

// 男友人设配置
export interface Personality {
  id: PersonalityType;
  name: string;
  avatar: string;
  description: string;
  traits: string[];
  defaultResponses?: string[];
  systemPrompt: string;
  prompt?: string;
  voice: {
    speaker: string;
    speechRate: number;
  };
  style: {
    tone: string;
    expressions: string[];
  };
}

// 消息
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: 'user' | 'boyfriend';
  timestamp: number;
  status?: MessageStatus;
  mediaUrl?: string;
  duration?: number; // 语音时长（秒）
}

// 对话历史
export interface Conversation {
  id: string;
  personalityId: PersonalityType;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 用户配置
export interface UserConfig {
  nickname: string;
  personalityId: PersonalityType | null;
  conversationId: string | null;
  lastVisit: number;
}

// 用户记忆
export interface UserMemory {
  keyEvents: string[];
  preferences: string[];
  relationshipMilestones: string[];
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 对话请求
export interface ChatRequest {
  message: string;
  personalityId: PersonalityType;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userId?: string;
}

// 对话响应
export interface ChatResponse {
  content: string;
  shouldGenerateVoice: boolean;
  shouldGenerateImage: boolean;
  shouldGenerateVideo: boolean;
}

// 语音请求
export interface VoiceRequest {
  text: string;
  personalityId: PersonalityType;
}

// 图像请求
export interface ImageRequest {
  prompt: string;
  personalityId: PersonalityType;
}

// 视频请求
export interface VideoRequest {
  prompt: string;
  personalityId: PersonalityType;
}
