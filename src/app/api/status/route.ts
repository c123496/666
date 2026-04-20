import { NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    providers: {
      gptimage: {
        name: 'GPT-Image',
        available: false,
        config: {
          hasApiKey: !!process.env.GPT_IMAGE_API_KEY,
          apiKeyPrefix: process.env.GPT_IMAGE_API_KEY?.substring(0, 10) + '...',
          baseURL: process.env.GPT_IMAGE_API_BASE,
        },
      },
      volcengine: {
        name: '火山引擎',
        available: false,
        config: {
          hasApiKey: !!process.env.VOLCENGINE_API_KEY,
          apiKeyPrefix: process.env.VOLCENGINE_API_KEY?.substring(0, 10) + '...',
          baseURL: process.env.VOLCENGINE_API_BASE,
        },
      },
      coze: {
        name: 'Coze',
        available: false,
        config: {
          hasApiKey: !!process.env.COZE_API_KEY,
          baseURL: process.env.COZE_API_BASE,
        },
      },
    },
    currentProvider: null as string | null,
  };

  // 检查当前可用的 provider
  const currentImageProvider = providerManager.getCurrentImageProvider();
  if (currentImageProvider) {
    status.currentProvider = currentImageProvider.name;
  }

  // 检查各个 provider 的可用性
  try {
    // 动态导入 provider 类
    const { GPTImageProvider } = await import('@/lib/providers/gptimage/image');
    const { VolcengineImageProvider } = await import('@/lib/providers/volcengine/image');
    const { CozeImageProvider } = await import('@/lib/providers/coze/image');

    const gptProvider = new GPTImageProvider();
    const volcengineProvider = new VolcengineImageProvider();
    const cozeProvider = new CozeImageProvider();

    status.providers.gptimage.available = gptProvider.isAvailable();
    status.providers.volcengine.available = volcengineProvider.isAvailable();
    status.providers.coze.available = cozeProvider.isAvailable();
  } catch (error) {
    console.error('Error checking provider status:', error);
  }

  return NextResponse.json(status);
}
