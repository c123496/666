import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getPersonality } from '@/lib/personalities';
import { VoiceRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: VoiceRequest = await request.json();
    const { text, personalityId } = body;

    if (!text || !personalityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const personality = getPersonality(personalityId);
    if (!personality) {
      return NextResponse.json({ error: 'Invalid personality' }, { status: 400 });
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 TTS 客户端
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 调用 TTS API
    const response = await client.synthesize({
      uid: 'virtual-boyfriend-user',
      text,
      speaker: personality.voice.speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
      speechRate: personality.voice.speechRate,
    });

    return NextResponse.json({
      success: true,
      audioUrl: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
