import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationClient, Config, HeaderUtils, APIError } from 'coze-coding-dev-sdk';
import { VideoRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel Hobby 计划限制最多 300 秒

export async function POST(request: NextRequest) {
  try {
    const body: VideoRequest = await request.json();
    const { prompt, personalityId } = body;

    console.log('[Video API] Received request:', { prompt, personalityId, timestamp: new Date().toISOString() });

    if (!prompt) {
      console.log('[Video API] Error: Missing prompt');
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    console.log('[Video API] Headers extracted');

    // 初始化视频生成客户端
    const config = new Config();
    const client = new VideoGenerationClient(config, customHeaders);
    console.log('[Video API] Client initialized');

    // 构建内容 - 简化提示词提高生成速度
    const content = [{ type: 'text' as const, text: prompt }];
    console.log('[Video API] Content prepared:', content);

    console.log('[Video API] Starting video generation at:', new Date().toISOString());
    
    // 调用视频生成 API
    const response = await client.videoGeneration(content, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: 5,
      ratio: '16:9',
      resolution: '720p',
      watermark: false,
      generateAudio: true,
      maxWaitTime: 900, // 15分钟等待时间
    });

    console.log('[Video API] Response received at:', new Date().toISOString());
    console.log('[Video API] Response:', {
      hasVideoUrl: !!response.videoUrl,
      videoUrl: response.videoUrl,
      status: response.response?.status,
      error: response.response?.error_message
    });

    if (response.videoUrl) {
      console.log('[Video API] Success! Returning video URL');
      return NextResponse.json({
        success: true,
        videoUrl: response.videoUrl,
      });
    } else {
      const errorMsg = response.response?.error_message || 'Video generation failed';
      console.error('[Video API] Generation failed:', errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Video API] Error at:', new Date().toISOString());
    
    if (error instanceof APIError) {
      console.error('[Video API] APIError:', error.message);
    } else {
      console.error('[Video API] Unknown error:', error);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // 如果是超时错误，返回更友好的提示
    if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
      console.log('[Video API] Timeout detected');
      return NextResponse.json(
        { success: false, error: '视频生成超时，请稍后重试' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
