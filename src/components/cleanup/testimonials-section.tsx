'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: '张晓敏',
    role: '市场总监 @ Raek',
    avatar: '张',
    content: '上周我花了很多时间尝试用类似的程序清理图片，但总是出现奇怪的涂抹和线条。我用 Cleanup.pictures 编辑同一张照片，30 秒就完成了，而且没有那些涂抹和线条！',
    rating: 5,
  },
  {
    name: '李明',
    role: '专业摄影师',
    avatar: '李',
    content: '这是我用过最好的图片清理工具。AI 技术真的让人惊叹，节省了大量后期处理时间。强烈推荐给所有摄影师！',
    rating: 5,
  },
  {
    name: '王芳',
    role: '电商运营 @ 某知名品牌',
    avatar: '王',
    content: '我们的产品图片处理效率提升了 10 倍。现在几分钟就能完成以前需要几小时的工作。客户满意度也大幅提升。',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            专家怎么说
          </h2>
          <p className="text-xl text-gray-600">
            来自行业专家的真实评价
          </p>
        </div>

        {/* 评价卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-8">
                {/* 引用图标 */}
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote className="w-16 h-16 text-gray-900" />
                </div>

                {/* 星级评价 */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* 评价内容 */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  {testimonial.content}
                </p>

                {/* 用户信息 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 信任标志 */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-8">
            被全球 10,000+ 专业人士信赖
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 text-gray-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10M+</div>
              <div className="text-sm">图片已处理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm">国家用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99%</div>
              <div className="text-sm">满意度</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
