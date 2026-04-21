'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Camera, Building2, Home, ShoppingBag, Type, Code } from 'lucide-react';

const useCases = [
  {
    icon: Camera,
    title: '摄影师',
    description: '快速移除照片中的干扰元素，让作品更加完美专业',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Building2,
    title: '创意机构',
    description: '高效处理客户图片，提升设计质量和交付速度',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Home,
    title: '房地产',
    description: '清理房产照片，让房源展示更加吸引人',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: ShoppingBag,
    title: '电商平台',
    description: '制作精美的产品图片，提升在线销售转化率',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Type,
    title: '移除文字、Logo',
    description: '轻松删除图片中的水印、文字或商标',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Code,
    title: '开发者 API',
    description: '集成强大的图片处理功能到您的应用中',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            适用场景
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            无论您从事什么行业，我们的 AI 技术都能帮助您快速处理图片
          </p>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-200 cursor-pointer"
              >
                <CardContent className="p-8">
                  <div className={`${useCase.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${useCase.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA 按钮 */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            准备好让您的产品图片脱颖而出了吗？
          </p>
          <p className="text-gray-500">
            直接上传产品照片，快速创建精美的产品展示图。
            <br />
            更新社交媒体内容，制作令人惊叹的 Instagram 故事。
          </p>
        </div>
      </div>
    </section>
  );
}
