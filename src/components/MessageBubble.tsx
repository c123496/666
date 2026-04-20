'use client';

import { Message, Personality } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';

interface MessageBubbleProps {
  message: Message;
  personality: Personality;
}

export default function MessageBubble({ message, personality }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 文本消息
  if (message.type === 'text') {
    return (
      <div className={`flex items-end mb-3 px-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        {!isUser && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-400 flex-shrink-0">
            <img
              src={personality.avatar}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 消息气泡 */}
        <div className={`max-w-[65%] ${isUser ? 'mr-2' : 'ml-2'}`}>
          <div
            className={`px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
              isUser
                ? 'bg-pink-500/80 text-white'
                : 'bg-white/10 text-white/90 backdrop-blur-sm border border-white/10'
            }`}
            style={{
              borderTopLeftRadius: isUser ? '4px' : '0px',
              borderTopRightRadius: isUser ? '0px' : '4px',
            }}
          >
            {message.content}
          </div>
        </div>

        {/* 用户头像占位 */}
        {isUser && (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
            我
          </div>
        )}
      </div>
    );
  }

  // 语音消息
  if (message.type === 'voice') {
    return (
      <div className={`flex items-end mb-3 px-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-400 flex-shrink-0">
            <img
              src={personality.avatar}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`max-w-[65%] ${isUser ? 'mr-2' : 'ml-2'}`}>
          <div
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 cursor-pointer backdrop-blur-sm border border-white/10 ${
              isUser ? 'bg-pink-500/80' : 'bg-white/10'
            }`}
            onClick={handlePlayAudio}
            style={{
              borderTopLeftRadius: isUser ? '4px' : '0px',
              borderTopRightRadius: isUser ? '0px' : '4px',
            }}
          >
            <div className="flex items-center space-x-1">
              <div className={`w-1 h-3 rounded-full ${isUser ? 'bg-white' : 'bg-white/60'}`} />
              <div className={`w-1 h-4 rounded-full ${isUser ? 'bg-white' : 'bg-white/60'}`} />
              <div className={`w-1 h-5 rounded-full ${isUser ? 'bg-white' : 'bg-white/60'}`} />
              <div className={`w-1 h-4 rounded-full ${isUser ? 'bg-white' : 'bg-white/60'}`} />
              <div className={`w-1 h-3 rounded-full ${isUser ? 'bg-white' : 'bg-white/60'}`} />
            </div>
            <span className="text-xs text-white/80">{message.duration ? `${message.duration}"` : '语音'}</span>
          </div>
          {message.mediaUrl && <audio ref={audioRef} src={message.mediaUrl} preload="metadata" />}
        </div>

        {isUser && (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
            我
          </div>
        )}
      </div>
    );
  }

  // 图片消息
  if (message.type === 'image') {
    return (
      <div className={`flex items-end mb-3 px-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-400 flex-shrink-0">
            <img
              src={personality.avatar}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`max-w-[65%] ${isUser ? 'mr-2' : 'ml-2'}`}>
          <div className="rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10">
            <img
              src={message.mediaUrl}
              alt="图片"
              className="w-full h-auto object-cover max-h-64"
              loading="lazy"
            />
          </div>
        </div>

        {isUser && (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
            我
          </div>
        )}
      </div>
    );
  }

  // 视频消息（紧凑卡片样式）
  if (message.type === 'video') {
    // 检查是否是B站链接
    const isBilibili = message.mediaUrl?.includes('bilibili');

    return (
      <div className={`flex items-end mb-3 px-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-400 flex-shrink-0">
            <img
              src={personality.avatar}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`max-w-[65%] ${isUser ? 'mr-2' : 'ml-2'}`}>
          <a
            href={message.mediaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl transition-shadow"
            style={{
              borderTopLeftRadius: isUser ? '8px' : '0px',
              borderTopRightRadius: isUser ? '0px' : '8px',
            }}
          >
            {/* 视频封面区域 */}
            <div className="relative bg-gradient-to-br from-pink-500/20 to-purple-500/20 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10" />
              {/* 播放按钮 */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-pink-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* 来源标签 */}
              {isBilibili && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FB7299] text-white text-xs font-medium">
                  B站
                </div>
              )}
              {/* 时长占位 */}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                视频
              </div>
            </div>
            {/* 视频标题 */}
            <div className="p-2.5">
              <p className="text-sm text-white/80 line-clamp-2 leading-snug">
                {message.content || '点击观看视频'}
              </p>
            </div>
          </a>
        </div>

        {isUser && (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
            我
          </div>
        )}
      </div>
    );
  }

  return null;
}
