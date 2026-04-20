/**
 * Provider 功能测试脚本
 *
 * 使用方法：
 * pnpm tsx test-providers.ts
 */

import { providerManager } from './src/lib/providers';

async function testImageGeneration() {
  console.log('🧪 测试图像生成...\n');

  try {
    console.log('1️⃣ 尝试使用火山引擎生成图像...');
    const result = await providerManager.generateImage({
      prompt: '一只可爱的小猫，漫画风格',
      size: '2K',
      watermark: false,
    });

    if (result.success) {
      console.log('✅ 图像生成成功！');
      console.log('   图片 URL:', result.imageUrl);
    } else {
      console.log('❌ 图像生成失败:', result.error);
    }
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error('   Provider:', error.provider);
    console.error('   错误码:', error.code);
  }

  console.log('\n📊 当前 Provider 信息:');
  const currentProvider = providerManager.getCurrentImageProvider();
  console.log('   类型:', currentProvider?.type);
  console.log('   名称:', currentProvider?.name);
  console.log('   可用:', currentProvider?.isAvailable());
}

// 运行测试
testImageGeneration()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试异常:', error);
    process.exit(1);
  });
