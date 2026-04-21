/**
 * 图片请求意图识别
 * 判断用户是否想要生成图片
 */

interface IntentMatch {
  matches: boolean;
  confidence: number;
  detectedKeywords: string[];
  isStrongTrigger: boolean; // 是否命中强触发词（明确命令）
}

/**
 * 检测用户消息是否包含图片请求意图
 */
export function detectImageIntent(userMessage: string): IntentMatch {
  const lowerMessage = userMessage.toLowerCase();

  // ==================== 强触发词（明确命令，100% 触发） ====================
  // 这些是用户的明确指令，不需要任何置信度判断，直接进入图片分支
  const strongTriggerKeywords = [
    // 简短明确命令
    '发照片',
    '发自拍',
    '发图',
    '发张照片',
    '发个照片',
    '发一张照片',
    '发张自拍',
    '发个自拍',
    '发一张自拍',
    '来张照片',
    '来个照片',
    '来张自拍',
    '来个自拍',
    '发张图',
    '来张图',

    // 带请求语气的明确命令
    '给我看看你',
    '让我看看你',
    '想看看你',
    '想看你',
    '看看你现在的样子',
    '看看你今天的样子',
    '我想看你',
    '给我看看',
    '让我看看',
    '看看你',
    '看一下',
    '看一眼',
    '看下你',

    // 英文命令
    'show me',
    'send photo',
    'send picture',
    'your photo',
    'your picture',
    'take a photo',
    'take a picture',
  ];

  // 高置信度关键词（明确要照片，但可能有附加描述）
  const highConfidenceKeywords = [
    '发张帅照',
    '发个帅照',
    '发张你的照片',
    '发张你的自拍',
    '给我一张你的照片',
    '发张照',
    '发个照',
  ];

  // 中置信度关键词（可能想要照片）
  const mediumConfidenceKeywords = [
    '穿西装的照片',
    '穿正装的照片',
    '睡衣照',
    '居家照',
    '日常照',
    '私服照',
    '穿搭照',
    '运动照',
    '健身照',
    '工作照',
    '睡前照',
    '起床照',
    '夜晚照',
    '清晨照',
    '今天的照片',
    '现在的照片',
    '现在的样子',
    '今天的样子',
    '你长什么样',
    '长什么样子',
    '照片呢',
    '自拍呢',
    '图片呢',
  ];

  // 低置信度关键词（可能只是聊天提到）
  const lowConfidenceKeywords = [
    '帅',
    '好看',
    '照片',
    '自拍',
    '图片',
    '模样',
    '样子',
    '长得',
  ];

  const detectedKeywords: string[] = [];
  let maxConfidence = 0;
  let isStrongTrigger = false;

  // ==================== 优先检查强触发词 ====================
  for (const keyword of strongTriggerKeywords) {
    if (lowerMessage.includes(keyword)) {
      detectedKeywords.push(keyword);
      isStrongTrigger = true;
      maxConfidence = 1.0; // 强触发词直接给最高置信度
      console.log(`\n[意图检测] ✅ 命中强触发词: "${keyword}"`);
      console.log(`[意图检测] ⚡ 直接进入图片生成分支（强触发）`);
      break; // 命中强触发词后立即停止检查
    }
  }

  // 如果没有命中强触发词，才继续检查其他关键词
  if (!isStrongTrigger) {
    // 检查高置信度关键词
    for (const keyword of highConfidenceKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        maxConfidence = Math.max(maxConfidence, 0.9);
      }
    }

    // 检查中置信度关键词
    for (const keyword of mediumConfidenceKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        maxConfidence = Math.max(maxConfidence, 0.7);
      }
    }

    // 检查低置信度关键词（需要结合其他条件）
    for (const keyword of lowConfidenceKeywords) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
        maxConfidence = Math.max(maxConfidence, 0.3);
      }
    }

    // 额外检查：如果只是夸奖，不触发图片生成
    const complimentPhrases = [
      '你好帅',
      '你真帅',
      '你长得好帅',
      '你很帅',
      '帅哥',
      '很帅啊',
      '帅呆了',
    ];

    const isJustCompliment = complimentPhrases.some(phrase =>
      lowerMessage === phrase || lowerMessage === phrase + '啊' || lowerMessage === phrase + '呀'
    );

    // 如果只是夸奖，降低置信度
    if (isJustCompliment && detectedKeywords.length <= 1) {
      maxConfidence = Math.min(maxConfidence, 0.2);
    }

    // 检查是否有明确的请求动词
    const requestVerbs = ['发', '给', '来', '让', '想看', '看看', 'show', 'send'];
    const hasRequestVerb = requestVerbs.some(verb => lowerMessage.includes(verb));

    // 如果没有明确的请求动词，降低置信度
    if (!hasRequestVerb && maxConfidence < 0.7) {
      maxConfidence = Math.min(maxConfidence, 0.3);
    }

    if (detectedKeywords.length > 0) {
      console.log(`\n[意图检测] ⚠️ 未命中强触发词`);
      console.log(`[意图检测] 检测到关键词:`, detectedKeywords);
      console.log(`[意图检测] 置信度: ${maxConfidence}`);
    }
  }

  // 最终判断：强触发词直接 true，否则需要置信度达到 0.5 以上
  const matches = isStrongTrigger || (maxConfidence >= 0.5 && detectedKeywords.length > 0);

  return {
    matches,
    confidence: maxConfidence,
    detectedKeywords,
    isStrongTrigger,
  };
}

/**
 * 判断是否应该生成图片
 */
export function shouldGenerateImage(userMessage: string): boolean {
  const result = detectImageIntent(userMessage);
  // 强触发词直接返回 true，否则需要置信度达到 0.5 以上
  return result.isStrongTrigger || (result.matches && result.confidence >= 0.5);
}
