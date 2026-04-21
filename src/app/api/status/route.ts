import { NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    providers: {
      volcengine: {
        name: '火山方舟 Seedream',
        available: false,
        config: {
          hasApiKey: !!process.env.VOLCENGINE_ARK_API_KEY,
          apiKeyPrefix: process.env.VOLCENGINE_ARK_API_KEY?.substring(0, 10) + '...',
          baseURL: process.env.VOLCENGINE_ARK_BASE_URL,
          model: process.env.VOLCENGINE_IMAGE_MODEL,
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
    const { VolcengineImageProvider } = await import('@/lib/providers/volcengine/image');
    const { CozeImageProvider } = await import('@/lib/providers/coze/image');

    const volcengineProvider = new VolcengineImageProvider();
    const cozeProvider = new CozeImageProvider();

    status.providers.volcengine.available = volcengineProvider.isAvailable();
    status.providers.coze.available = cozeProvider.isAvailable();
  } catch (error) {
    console.error('Error checking provider status:', error);
  }

  return NextResponse.json(status);
}
