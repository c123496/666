'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Zap, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '快速集成',
    description: '几分钟内即可集成到您的应用中',
  },
  {
    icon: Shield,
    title: '企业级安全',
    description: '符合 SOC 2 标准，数据安全有保障',
  },
  {
    icon: Globe,
    title: '全球可用',
    description: '99.9% 正常运行时间保证',
  },
];

const codeExamples = [
  {
    language: 'Node.js',
    code: `const cleanup = require('cleanup-api');

const result = await cleanup.removeObject({
  imageUrl: 'https://example.com/image.jpg',
  mask: ['x1,y1,x2,y2'] // 要移除的区域坐标
});

console.log(result.processedImageUrl);`,
  },
  {
    language: 'Python',
    code: `import cleanup_api

result = cleanup_api.remove_object(
    image_url="https://example.com/image.jpg",
    mask=['x1,y1,x2,y2']
)

print(result.processed_image_url)`,
  },
  {
    language: 'cURL',
    code: `curl -X POST \\
  https://api.cleanup.pictures/v1/remove \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "mask=x1,y1,x2,y2"`,
  },
];

export function ApiSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Code className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">开发者 API</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            强大的 API，无限可能
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            在您的产品中使用高质量的图片处理 API。支持多种编程语言，文档完善。
          </p>
        </div>

        {/* 特性卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 代码示例 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {codeExamples.map((example, index) => (
            <Card key={index} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono text-gray-400">
                    {example.language}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    复制
                  </Button>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            查看完整文档
          </Button>
          <p className="mt-4 text-gray-400">
            提供实时演示和丰富的示例代码
          </p>
        </div>
      </div>
    </section>
  );
}
