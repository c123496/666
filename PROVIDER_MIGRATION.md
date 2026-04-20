# AI Provider 适配层

## 📖 概述

本项目实现了统一的 AI Provider 适配层，支持多个 AI 服务商的切换和自动回退。

**当前状态：**
- ✅ 图像生成：火山引擎优先，Coze 回退
- ⚠️ 聊天：仅 Coze（火山引擎待实现）
- ⚠️ 语音合成：仅 Coze（火山引擎待实现）
- ⚠️ 视频生成：仅 Coze（火山引擎待实现）
- ❌ 视频搜索：保持用 Coze（不迁移）

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────┐
│           API Routes                     │
│  (/api/image, /api/chat, /api/voice)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Provider Manager                    │
│      (自动回退机制)                       │
└──────┬──────────────────────────────────┬┘
       │                                  │
       ▼                                  ▼
┌──────────────┐                  ┌──────────────┐
│ Volcengine   │   (Fallback)     │     Coze      │
│ Provider     │ ◄───────────────│   Provider    │
└──────────────┘                  └──────────────┘
```

---

## 🚀 使用方法

### 1. 环境变量配置

在 `.env.local` 中配置：

```bash
# 火山引擎 API
VOLCENGINE_API_KEY=your_api_key_here
VOLCENGINE_API_BASE=https://ark.cn-beijing.volces.com/api/v3

# Coze API（可选，作为回退）
COZE_API_KEY=your_coze_key
```

### 2. 在 API 路由中使用

```typescript
import { providerManager } from '@/lib/providers';
import { ApiError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    // 图像生成（自动回退）
    const result = await providerManager.generateImage({
      prompt: '一只可爱的猫咪',
      size: '2K',
      watermark: false,
    });

    if (result.success) {
      return NextResponse.json({ imageUrl: result.imageUrl });
    }
  } catch (error) {
    // 错误已被自动分类和处理
    console.error('图像生成失败:', error);
  }
}
```

### 3. 错误处理

所有错误都会被自动分类为友好的业务错误：

| 错误码 | 含义 | HTTP 状态码 |
|--------|------|-------------|
| 401 | API Key 无效 | 401 |
| 403 | 无权限访问 | 401 |
| 429 | 请求过于频繁 | 429 |
| 5XX | 服务暂时不可用 | 503 |
| TIMEOUT | 请求超时 | 504 |
| NETWORK_ERROR | 网络连接失败 | 503 |

```typescript
import { ApiError } from '@/lib/api-error';

try {
  await providerManager.generateImage({ prompt });
} catch (error) {
  if (error instanceof ApiError) {
    console.log('错误码:', error.code);
    console.log('错误消息:', error.message);
    console.log('服务商:', error.provider);
  }
}
```

---

## 📊 可观测性

所有 API 调用都会自动记录结构化日志：

```json
{
  "timestamp": "2026-04-09T10:30:00.000Z",
  "provider": "volcengine",
  "endpoint": "/images/generations",
  "method": "POST",
  "duration": 2341,
  "status": 200,
  "success": true
}
```

---

## 🔧 扩展新 Provider

如果将来需要添加其他 AI 服务商（如 OpenAI、Claude），按以下步骤操作：

### Step 1: 实现 Provider 接口

```typescript
// src/lib/providers/openai/image.ts
import { ImageProvider, ImageGenerationParams, ImageGenerationResult } from '../types';

export class OpenAIImageProvider implements ImageProvider {
  readonly type = 'openai' as const;
  readonly name = 'OpenAI DALL-E';

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    // 实现你的逻辑
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: params.prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.data[0].url,
    };
  }
}
```

### Step 2: 注册到 Provider Manager

```typescript
// src/lib/providers/manager.ts
import { OpenAIImageProvider } from './openai/image';

private initializeProviders(): void {
  this.imageProviders = [
    new VolcengineImageProvider(),
    new CozeImageProvider(),
    new OpenAIImageProvider(), // 新增
  ];
}
```

### Step 3: 更新导出索引

```typescript
// src/lib/providers/index.ts
export * from './openai/image';
```

---

## ⚠️ 待实现功能

以下功能需要火山引擎的完整 API 文档才能实现：

### 1. 聊天 API

**需要信息：**
- 端点路径（可能是 `/chat/completions`）
- 请求参数格式
- 流式响应格式（SSE）
- 支持的模型列表

**预估实现难度：** 中等

### 2. 语音合成 API

**需要信息：**
- 端点路径（可能是 `/audio/speech`）
- 参数映射：speaker → voice, speechRate → speed
- 返回格式：URL 或 base64

**预估实现难度：** 简单

### 3. 视频生成 API

**需要信息：**
- 端点路径
- 是否支持同步返回（还是异步轮询）
- 支持的参数：duration, ratio, resolution

**预估实现难度：** 中高（可能需要处理长时间任务）

---

## 📝 实现新 Provider 的模板

当你获取到火山引擎的 API 文档后，可以参考以下模板实现：

### 图像生成（已完成）✅

参考文件：`src/lib/providers/volcengine/image.ts`

### 聊天

参考文件：`src/lib/providers/volcengine/chat.ts`

```typescript
async *streamChat(params: ChatParams): AsyncIterable<ChatStreamChunk> {
  const response = await fetch(`${this.config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || 'doubao-pro',
      messages: params.messages,
      stream: true,
      temperature: params.temperature || 0.7,
    }),
  });

  // 处理 SSE 流
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          yield { content: '', done: true };
          return;
        }

        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          yield { content };
        }
      }
    }
  }
}
```

### 语音合成

```typescript
async synthesize(params: TTSParams): Promise<TTSResult> {
  const response = await fetch(`${this.config.baseURL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: params.text,
      voice: mapSpeakerToVoice(params.speaker),
      response_format: params.audioFormat || 'mp3',
      speed: mapSpeechRateToSpeed(params.speechRate),
    }),
  });

  const audioBlob = await response.blob();
  const audioUri = URL.createObjectURL(audioBlob);

  return {
    audioUri,
    audioSize: audioBlob.size,
  };
}
```

---

## 🔍 调试技巧

### 查看当前使用的 Provider

```typescript
const currentProvider = providerManager.getCurrentImageProvider();
console.log('当前 Provider:', currentProvider?.name);
```

### 启用详细日志

所有 API 调用都会自动打印日志到控制台，包含：
- Provider 类型
- 端点路径
- 请求耗时
- 成功/失败状态
- 错误信息

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `src/lib/providers/types.ts` | 类型定义 |
| `src/lib/providers/manager.ts` | Provider 管理器 |
| `src/lib/providers/volcengine/*.ts` | 火山引擎 Providers |
| `src/lib/providers/coze/*.ts` | Coze Providers |
| `src/lib/api-error.ts` | 错误处理和日志工具 |
| `.env.local` | 环境变量配置 |

---

## 🆘 常见问题

**Q: 如何强制使用某个 Provider？**

A: 目前不支持，但可以在 Manager 中添加优先级配置。

**Q: 如何添加新的回退策略？**

A: 修改 `ProviderManager` 中的 Provider 列表顺序即可。

**Q: 图像生成失败怎么办？**

A: 系统会自动从火山引擎回退到 Coze，无需手动处理。

**Q: 如何监控 API 调用成本？**

A: 日志中包含所有调用记录，可以集成到监控系统。
