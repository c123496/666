'use client';

import { useState, useRef, useEffect } from 'react';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { GameRecordToast } from '@/components/game-record-toast';
import { useGameRecord } from '@/hooks/useGameRecord';

interface ChatInterfaceProps {
  personalityId: string;
  onBack: () => void;
}

// 角色数据 - 包含真实姓名和个性化欢迎语
const personalities = {
  ceo: {
    name: '顾承川',
    type: '霸道总裁',
    avatar: '顾',
    greeting: '终于来了，我等你很久。工作处理完了，现在的时间都是你的。',
  },
  sweet: {
    name: '沈予安',
    type: '温柔男友',
    avatar: '沈',
    greeting: '今天想先聊什么？我在。不论你想说什么，我都会认真听的。',
  },
  actor: {
    name: '陆景言',
    type: '浪漫演员',
    avatar: '陆',
    greeting: '见到你之后，今晚好像都变得更浪漫了。这种感觉，我很喜欢。',
  },
  striver: {
    name: '周屿川',
    type: '奋斗青年',
    avatar: '周',
    greeting: '辛苦一天了吧？我陪你聊聊。不论发生什么，我都会陪着你的。',
  },
};

// 扩展消息类型，支持图片
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export function ChatInterface({ personalityId, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const personality = personalities[personalityId as keyof typeof personalities];

  // 游戏记录管理
  const { saveGameRecord, showToast, toastMessage, toastType, hideToast, handleLoginRedirect } = useGameRecord();

  // 初始化时设置个性化欢迎语
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: personality.greeting,
      },
    ]);
  }, [personalityId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEndGame = async () => {
    const messageCount = messages.filter((m) => m.role === 'user').length;
    await saveGameRecord(personality.name, messageCount);
    // 返回首页或记录页面
    if (toastType === 'success') {
      window.location.href = '/profile';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 调用真实的聊天 API
      console.log('[聊天] 发送消息:', { userMessage, personalityId });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          personalityId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        console.error('[聊天] API 请求失败:', response.status, response.statusText);
        throw new Error('API request failed');
      }

      console.log('[聊天] API 响应成功，开始读取流');

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // 创建一个新的空消息用于接收响应
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      let currentContent = '';
      let currentImageUrl: string | undefined;
      let hasReceivedImage = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              console.log('[聊天] 流式接收完成', { hasImage: hasReceivedImage, imageUrl: currentImageUrl });
              setIsLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'image') {
                // 接收到图片
                console.log('[聊天] ✅ 收到图片消息:', parsed.imageUrl);
                hasReceivedImage = true;
                currentImageUrl = parsed.imageUrl;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.imageUrl = parsed.imageUrl;
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'text') {
                // 接收到文本内容
                currentContent += parsed.content;
                console.log('[聊天] 收到文字内容，当前长度:', currentContent.length);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = currentContent;
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'error') {
                // 接收到错误消息
                console.error('[聊天] ❌ 收到错误消息:', parsed.content);
                currentContent += `\n\n⚠️ ${parsed.content}`;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = currentContent;
                  }
                  return newMessages;
                });
              } else if (parsed.content) {
                // 兼容旧格式
                currentContent += parsed.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = currentContent;
                  }
                  return newMessages;
                });
              } else if (parsed.error) {
                console.error('[聊天] 流式错误:', parsed.error);
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  {
                    role: 'assistant',
                    content: '抱歉，我刚才有点走神。能再说一遍吗？💕',
                  },
                ]);
              }
            } catch (e) {
              console.error('[聊天] 解析消息失败:', e, data);
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，我刚才有点累，能稍后再聊吗？💕',
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#ededed]">
      {/* 顶部导航栏 - 显示真实姓名和类型 */}
      <ChatHeader
        name={personality.name}
        type={personality.type}
        onBack={onBack}
        onEndGame={handleEndGame}
      />

      {/* 聊天消息区域 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              imageUrl={message.imageUrl}
              name={message.role === 'assistant' ? personality.name : undefined}
              type={message.role === 'assistant' ? personality.type : undefined}
            />
          ))}
          {isLoading && <TypingIndicator name={personality.name} type={personality.type} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={isLoading} />

      {/* 游戏记录提示 */}
      <GameRecordToast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={hideToast}
        onAction={handleLoginRedirect}
      />
    </div>
  );
}

/* ==================== 子组件 ==================== */

// 顶部导航栏 - 显示姓名和类型
function ChatHeader({
  name,
  type,
  onBack,
  onEndGame
}: {
  name: string;
  type: string;
  onBack: () => void;
  onEndGame: () => void;
}) {
  return (
    <div className="flex-shrink-0 bg-[#ededed] border-b border-[#d1d1d1] px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 -ml-2 text-black hover:bg-[#d1d1d1] rounded transition-colors"
          aria-label="返回"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 真人头像 */}
        <PersonAvatar
          name={name}
          type={type}
          size="sm"
        />

        <div className="flex-1 text-center pr-10">
          <h1 className="text-base font-semibold text-black">{name}</h1>
          <p className="text-xs text-gray-500">{type}</p>
        </div>

        {/* 结束游戏按钮 */}
        <button
          onClick={onEndGame}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          结束
        </button>
      </div>
    </div>
  );
}

// 消息气泡
function MessageBubble({
  role,
  content,
  imageUrl,
  name,
  type,
}: {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  name?: string;
  type?: string;
}) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && name && type && <PersonAvatar name={name} type={type} size="sm" />}

      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 文字内容 */}
        {content && (
          <div
            className={`px-3 py-2 text-[15px] leading-relaxed break-words ${
              isUser ? 'bg-[#95ec69] text-black rounded-lg' : 'bg-white text-black rounded-lg'
            }`}
            style={{
              wordBreak: 'break-word',
            }}
          >
            {content}
          </div>
        )}

        {/* 图片内容 */}
        {imageUrl && (
          <div className={`mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            <img
              src={imageUrl}
              alt="男友照片"
              className="max-w-full rounded-lg shadow-md"
              style={{
                maxHeight: '300px',
                objectFit: 'cover',
              }}
              onLoad={(e) => {
                // 图片加载完成后滚动到底部
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 正在输入提示
function TypingIndicator({ name, type }: { name: string; type: string }) {
  return (
    <div className="flex gap-2">
      <PersonAvatar name={name} type={type} size="sm" />
      <div className="bg-white px-4 py-3 rounded-lg">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}

// 输入框区域
function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex-shrink-0 bg-[#f7f7f7] border-t border-[#d1d1d1] px-4 py-3">
      <div className="max-w-3xl mx-auto flex gap-2 items-end">
        <div className="flex-1 bg-white rounded border border-[#d1d1d1] px-3 py-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder=""
            className="w-full bg-transparent outline-none text-[15px] text-black placeholder-gray-400 resize-none"
            rows={1}
            disabled={disabled}
            style={{
              minHeight: '20px',
              maxHeight: '100px',
            }}
          />
        </div>

        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 px-4 py-2 bg-[#ededed] text-black text-[15px] font-medium rounded hover:bg-[#d1d1d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
}

/* ==================== 工具函数 ==================== */
