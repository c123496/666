'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '什么是智能修复（Inpainting）？',
    answer: '智能修复是一种用于移除照片中不需要对象的技术。它可以用于移除不需要的人、文字、水印或其他物体。传统的修复工具需要手动克隆背景区域，而现代 AI 技术可以智能推断被遮挡区域的内容，效果更加自然。',
  },
  {
    question: '为什么 Cleanup.pictures 比其他工具更好？',
    answer: 'Cleanup.pictures 基于先进的人工智能技术，比传统的克隆印章工具效果更好。Adobe Photoshop 等工具需要背景参考，而我们的 AI 能够真正智能猜测不需要的文字、人物或物体背后的内容，只需几次点击即可完成。',
  },
  {
    question: '支持哪些图片分辨率？',
    answer: '您可以导入和编辑任何大小的图片。免费版本导出限制为 720px，专业版本没有大小限制。我们持续改进导出图片的质量。',
  },
  {
    question: 'Cleanup.pictures 多少钱？',
    answer: 'Cleanup.pictures 是免费的，除非您需要更高质量和处理高分辨率图片。专业版价格为每月 ¥30 或每年 ¥240（每月 ¥20）。试用版可以免费测试 HD 质量。您的订阅在移动端和桌面端都可以使用。',
  },
  {
    question: '退款政策是什么？',
    answer: '我们提供免费试用期，让您在购买前充分评估产品。一旦购买专业版，如果订阅时间少于 14 天，可以全额退款；超过 14 天的部分退款。技术问题、平台不兼容或其他不可预见情况下可申请退款。',
  },
  {
    question: '如何管理、暂停或取消订阅？',
    answer: '您可以通过访问"管理订阅"部分来管理您的订阅。',
  },
  {
    question: '一个订阅可以多少人使用？',
    answer: '每个 Cleanup 订阅都是个人的，仅限 1 位用户使用。',
  },
  {
    question: '如何使用智能修复 API？',
    answer: 'Cleanup 的 API 可用于任何环境，如 Node.js、SwiftUI、Kotlin 等。我们提供详尽的文档、实时演示和大量示例，帮助您快速上手。',
  },
  {
    question: '如何从照片中移除人物？',
    answer: '使用 cleanup.pictures 可以在几秒钟内免费移除照片中的人物。不需要 Adobe Photoshop 等复杂软件。只需几次点击即可获得专业效果。提示：选择更大的画笔，不要犹豫覆盖比您想要修复的区域更大的面积（尤其是覆盖阴影时）。这将帮助算法创建最佳效果。',
  },
  {
    question: '如何移除不需要的对象？',
    answer: '使用 cleanup.pictures 移除不需要的对象、人物或缺陷。AI 算法将在一次点击中重建对象背后的内容。确保不需要的元素被覆盖。您可以用同样的方式移除人物或文字。',
  },
  {
    question: '如何移除文字、Logo 或水印？',
    answer: '您可以使用 cleanup.pictures 在几秒钟内以惊人的准确度移除图片中不需要的文字。像处理对象或人物一样，只需将图片加载到工具中，在要移除的文字或水印上绘制。几秒钟后，您将看到它完全消失。提示：确保溢出并绘制比您实际要移除的区域稍大的区域。注意：水印通常表示图片有版权限制。仅移除您有明确许可的图片上的水印。',
  },
  {
    question: '如何移除瑕疵或皱纹？',
    answer: '您可以使用 CleanUp 画笔从头像中移除瑕疵或皱纹。像其他照片修饰一样，确保画笔覆盖它，然后下载结果。',
  },
  {
    question: '如何移除图片背景？',
    answer: '在线或手机移除照片背景的最佳方法是使用 ClipDrop。它提供目前最好的质量和超高清分辨率。您可以下载带透明或白色背景的图片。',
  },
];

export function FaqSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            常见问题
          </h2>
          <p className="text-xl text-gray-600">
            快速找到您关心的答案
          </p>
        </div>

        {/* FAQ 列表 */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-2 rounded-xl px-6 data-[state=open]:bg-gray-50"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* 联系支持 */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            还有问题？
          </h3>
          <p className="text-gray-600 mb-6">
            我们的支持团队随时准备回答您的所有问题
          </p>
          <a
            href="mailto:support@cleanup.pictures"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            联系支持 →
          </a>
        </div>
      </div>
    </section>
  );
}
