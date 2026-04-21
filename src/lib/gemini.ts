/**
 * EvoLink Gemini API 适配层
 * 将 OpenAI 格式转换为 Gemini Native API 格式
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeminiContent {
  role: string;
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiContent[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

/**
 * 将消息数组转换为 Gemini contents 格式
 */
export function convertToGeminiFormat(messages: Message[]): GeminiRequest {
  const contents: GeminiContent[] = messages
    .filter(msg => msg.role !== 'system') // Gemini 不支持 system role
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  return { contents };
}

/**
 * 从 Gemini 响应中提取文本
 */
export function extractTextFromGeminiResponse(response: GeminiResponse): string {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Empty response from Gemini API');
  }

  const parts = response.candidates[0].content.parts;
  if (!parts || parts.length === 0) {
    throw new Error('No content parts in Gemini response');
  }

  // 拼接所有 parts 的文本
  return parts.map(part => part.text).join('');
}

/**
 * 调用 EvoLink Gemini Native API (非流式)
 */
export async function generateText(
  messages: Message[],
  personalityPrompt: string = ''
): Promise<string> {
  const apiKey = process.env.EVOLINK_API_KEY;
  const baseUrl = process.env.EVOLINK_BASE_URL || 'https://api.evolink.ai';
  const model = process.env.TEXT_MODEL || 'gemini-2.5-flash-lite';

  if (!apiKey) {
    throw new Error('EVOLINK_API_KEY is not set');
  }

  // 转换为 Gemini 格式
  const geminiRequest = convertToGeminiFormat(messages);

  // 如果有角色设定，添加到第一条用户消息前
  if (personalityPrompt && geminiRequest.contents.length > 0) {
    const firstUserContent = geminiRequest.contents[0];
    if (firstUserContent.role === 'user') {
      firstUserContent.parts[0].text = `${personalityPrompt}\n\n${firstUserContent.parts[0].text}`;
    }
  }

  console.log('发送 Gemini 请求:', JSON.stringify(geminiRequest, null, 2));

  try {
    const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API 错误:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('收到 Gemini 响应:', JSON.stringify(data, null, 2));

    return extractTextFromGeminiResponse(data);
  } catch (error) {
    console.error('调用 Gemini API 失败:', error);
    throw error;
  }
}
