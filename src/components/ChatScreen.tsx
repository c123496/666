'use client';

import { useState, useEffect, useRef } from 'react';
import { getPersonality, getGreeting } from '@/lib/personalities';
import { UserConfigManager, ConversationManager } from '@/lib/storage';
import { Message, PersonalityType } from '@/lib/types';
import MessageBubble from './MessageBubble';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Send, MoreVertical, Trash2, LogOut, Loader2, X } from 'lucide-react';

export default function ChatScreen() {
  const [personality, setPersonality] = useState(getPersonality('ceo'));
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNickname = UserConfigManager.getNickname();
    const savedPersonalityId = UserConfigManager.getPersonalityId() as PersonalityType;

    if (savedNickname) setNickname(savedNickname);
    if (savedPersonalityId) {
      // 验证 personalityId 是否有效
      const validPersonalities: PersonalityType[] = ['ceo', 'sweet', 'actor', 'striver'];
      if (!validPersonalities.includes(savedPersonalityId)) {
        // 如果存储的 personalityId 无效，清除配置并重新加载
        console.warn(`Invalid personalityId found: ${savedPersonalityId}. Clearing config...`);
        UserConfigManager.clearAll();
        window.location.reload();
        return;
      }

      try {
        const personality = getPersonality(savedPersonalityId);
        setPersonality(personality);

        const conversation = ConversationManager.getCurrentConversation();
        if (conversation && conversation.messages.length === 0) {
          const greeting = getGreeting(savedPersonalityId, savedNickname);
          const greetingMessage: Message = {
            id: `greeting-${Date.now()}`,
            type: 'text',
            content: greeting,
            sender: 'boyfriend',
            timestamp: Date.now(),
          };
          setMessages([greetingMessage]);
          ConversationManager.addMessage(conversation.id, {
            type: 'text',
            content: greeting,
            sender: 'boyfriend',
          });
        } else if (conversation) {
          setMessages(conversation.messages);
        }
      } catch (error) {
        console.error('Failed to load personality:', error);
        // 如果加载失败，清除配置
        UserConfigManager.clearAll();
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 调试函数：检测当前输入会触发什么
  const debugMediaDetection = (text: string) => {
    const videoCheck = shouldGenerateVideo(text);
    const imageCheck = shouldGenerateImage(text);
    const voiceCheck = shouldGenerateVoice();

    console.log('=== 媒体检测调试 ===');
    console.log('输入内容:', text);
    console.log('视频关键词触发:', videoCheck);
    console.log('图片关键词触发:', imageCheck);
    console.log('语音随机触发:', voiceCheck);
    console.log('最终决定:', {
      生成视频: videoCheck,
      生成图片: !videoCheck && imageCheck,
      生成语音: !videoCheck && !imageCheck && voiceCheck,
      仅文字: !videoCheck && !imageCheck && !voiceCheck
    });
    console.log('==================');

    return { videoCheck, imageCheck, voiceCheck };
  };

  const shouldGenerateImage = (text: string): boolean => {
    const imageKeywords = [
      '美食', '好吃的', '风景', '旅游', '漂亮', '好看', '拍照', '照片', '图片', '看看', '发个', '送你', '给你看',
      '图片', '图像', '照片', '截图', '画', '图', '看看', '瞧瞧', '展示', '给我看',
      '生成图片', '生成图', '画个', '拍张', '来张', '发张', '看张',
      '图呢', '有图吗', '来图', '发图', '上图', '配图', '插图'
    ];
    const result = imageKeywords.some(keyword => text.includes(keyword));
    console.log('图片关键词检测:', { text, keywords: imageKeywords, result });
    return result;
  };

  const shouldGenerateVideo = (text: string): boolean => {
    const videoKeywords = ['纪念日', '生日', '在一起', '爱你', '想你', '特别', '重要', '难忘', '结婚', '求婚', '情人节', '圣诞', '跨年', '新年', '浪漫', '惊喜', '表白', '约会', '周年', '礼物'];
    console.log('[ChatScreen] Checking video keywords for:', text, 'result:', videoKeywords.some(keyword => text.includes(keyword)));
    return videoKeywords.some(keyword => text.includes(keyword));
  };

  const shouldGenerateVoice = (): boolean => {
    return voiceEnabled && Math.random() > 0.6;
  };

  // 只生成语音消息（不显示文字）
  const generateVoiceOnlyMessage = async (text: string) => {
    try {
      setIsGeneratingMedia('voice');
      
      // 缩短语音文本
      let voiceText = text.slice(0, 60);
      voiceText = voiceText.replace(/（[^）]*）/g, '').trim();
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText,
          personalityId: personality.id,
        }),
      });

      const data = await response.json();
      if (data.success && data.audioUrl) {
        const voiceMessage: Message = {
          id: `voice-${Date.now()}`,
          type: 'voice',
          content: '',
          mediaUrl: data.audioUrl,
          duration: Math.ceil(data.audioSize / 4000),
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        
        setMessages((prev) => [...prev, voiceMessage]);
        
        const conversationId = UserConfigManager.getConversationId();
        if (conversationId) {
          ConversationManager.addMessage(conversationId, {
            type: 'voice',
            content: '',
            mediaUrl: data.audioUrl,
            duration: Math.ceil(data.audioSize / 4000),
            sender: 'boyfriend',
          });
        }
      } else {
        // 语音生成失败，显示文字作为备选
        const textMessage: Message = {
          id: `text-${Date.now()}`,
          type: 'text',
          content: text,
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, textMessage]);
        
        const conversationId = UserConfigManager.getConversationId();
        if (conversationId) {
          ConversationManager.addMessage(conversationId, {
            type: 'text',
            content: text,
            sender: 'boyfriend',
          });
        }
      }
    } catch (error) {
      console.error('Voice generation error:', error);
    } finally {
      setIsGeneratingMedia(null);
    }
  };

  const generateImageMessage = async (text: string) => {
    try {
      setIsGeneratingMedia('image');
      console.log('[图像生成] 开始生成，prompt:', text.slice(0, 30));

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `温馨浪漫的场景，适合情侣，${text.slice(0, 30)}`,
          personalityId: personality.id,
        }),
      });

      const data = await response.json();
      console.log('[图像生成] API 响应:', data);

      if (data.success && data.imageUrl) {
        const imageMessage: Message = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: '',
          mediaUrl: data.imageUrl,
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, imageMessage]);

        const conversationId = UserConfigManager.getConversationId();
        if (conversationId) {
          ConversationManager.addMessage(conversationId, {
            type: 'image',
            content: '',
            mediaUrl: data.imageUrl,
            sender: 'boyfriend',
          });
        }
        console.log('[图像生成] 成功添加图片消息');
      } else {
        console.error('[图像生成] 失败:', data.error);

        // 显示详细的错误提示
        const errorDetail = data.error || '未知错误';
        const friendlyMessage = `抱歉，图片生成暂时不可用。\n\n(错误: ${errorDetail}\n\n可能是 API 配置问题或服务暂时不可用，你可以继续和我聊天，图片功能会尽快恢复！)`;

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'text',
          content: friendlyMessage,
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[图像生成] 异常:', error);

      // 显示异常错误提示
      const friendlyMessage = '抱歉，图片生成服务出现异常。\n\n(可能是网络问题或所有图片 API 都暂时不可用。别担心，我们仍然可以正常聊天！图片功能会尽快恢复。)';

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'text',
        content: friendlyMessage,
        sender: 'boyfriend',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingMedia(null);
    }
  };

  const generateVideoMessage = async (text: string) => {
    console.log('[ChatScreen] generateVideoMessage called with:', text);
    try {
      setIsGeneratingMedia('video');
      console.log('[ChatScreen] Calling /api/video-search...');
      
      // 使用视频搜索API（快速获取视频素材）
      const response = await fetch('/api/video-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          personalityId: personality.id,
        }),
      });

      const data = await response.json();
      console.log('[ChatScreen] Video Search API response:', data);
      
      if (data.success && data.videos && data.videos.length > 0) {
        const video = data.videos[0];
        
        // 创建视频消息（直接在聊天中嵌入播放）
        const videoMessage: Message = {
          id: `video-${Date.now()}`,
          type: 'video',
          content: video.title,
          mediaUrl: video.url,
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, videoMessage]);

        const conversationId = UserConfigManager.getConversationId();
        if (conversationId) {
          ConversationManager.addMessage(conversationId, {
            type: 'video',
            content: video.title,
            mediaUrl: video.url,
            sender: 'boyfriend',
          });
        }
      } else {
        console.error('[ChatScreen] Video search failed:', data);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'text',
          content: '抱歉，没找到合适的视频，我们换个话题聊聊吧~🥺',
          sender: 'boyfriend',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[ChatScreen] Video search error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'text',
        content: '抱歉，搜索视频出错了，我们换个话题聊聊吧~',
        sender: 'boyfriend',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingMedia(null);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'text',
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = inputMessage.trim();
    setInputMessage('');
    setIsStreaming(true);

    const conversationId = UserConfigManager.getConversationId();
    if (conversationId) {
      ConversationManager.addMessage(conversationId, {
        type: 'text',
        content: userText,
        sender: 'user',
      });
    }

    // 预先判断媒体类型 - 优先级：视频 > 图片 > 语音
    const willGenerateVideo = shouldGenerateVideo(userText);
    const willGenerateImage = !willGenerateVideo && shouldGenerateImage(userText);
    const willGenerateVoice = !willGenerateVideo && !willGenerateImage && shouldGenerateVoice(); // 只有在没有视频和图片时才考虑语音

    // 调试输出
    debugMediaDetection(userText);

    // 如果要生成语音，不添加文字消息占位符
    const aiMessageId = `ai-${Date.now()}`;
    if (!willGenerateVoice) {
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'text',
        content: '',
        sender: 'boyfriend',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          personalityId: personality.id,
          conversationHistory: messages
            .filter((m) => m.type === 'text')
            .map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  // 只有不需要语音时才显示文字
                  if (!willGenerateVoice) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMessageId ? { ...m, content: accumulatedContent } : m
                      )
                    );
                  }
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }

        if (accumulatedContent) {
          console.log('[ChatScreen] accumulatedContent:', accumulatedContent.slice(0, 50));
          console.log('[ChatScreen] willGenerateVoice:', willGenerateVoice, 'willGenerateVideo:', willGenerateVideo, 'willGenerateImage:', willGenerateImage);
          
          if (willGenerateVoice) {
            // 只生成语音，不保存文字
            generateVoiceOnlyMessage(accumulatedContent);
          } else {
            // 保存文字消息
            if (conversationId) {
              ConversationManager.addMessage(conversationId, {
                type: 'text',
                content: accumulatedContent,
                sender: 'boyfriend',
              });
            }
          }

          // 视频和图片作为额外消息（视频搜索很快，不需要等待太久）
          if (willGenerateVideo) {
            console.log('[ChatScreen] Triggering video search...');
            setTimeout(() => generateVideoMessage(accumulatedContent), 800);
          } else if (willGenerateImage) {
            setTimeout(() => generateImageMessage(accumulatedContent), 1500);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (!willGenerateVoice) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: '抱歉，我遇到了一些问题，请稍后再试...', status: 'failed' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    const conversationId = UserConfigManager.getConversationId();
    if (conversationId) {
      ConversationManager.clearConversation(conversationId);
    }
    const newConversation = ConversationManager.createConversation(personality.id);
    const greeting = getGreeting(personality.id, nickname);
    const greetingMessage: Message = {
      id: `greeting-${Date.now()}`,
      type: 'text',
      content: greeting,
      sender: 'boyfriend',
      timestamp: Date.now(),
    };
    setMessages([greetingMessage]);
    ConversationManager.addMessage(newConversation.id, {
      type: 'text',
      content: greeting,
      sender: 'boyfriend',
    });
    setShowSettings(false);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？所有数据将被清除。')) {
      UserConfigManager.clearAll();
      window.location.reload();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const groupedMessages = () => {
    const groups: { time: string; messages: Message[] }[] = [];
    let currentGroup: { time: string; messages: Message[] } | null = null;

    messages.forEach((message) => {
      const messageTime = formatTime(message.timestamp);
      
      if (!currentGroup || currentGroup.time !== messageTime) {
        currentGroup = { time: messageTime, messages: [message] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  return (
    <div className="flex h-screen flex-col bg-[#030303]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#030303]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 relative">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-400 flex-shrink-0">
              <img
                src={personality.avatar}
                alt={personality.name}
                className="w-full h-full object-cover"
              />
            </div>
            <GlowingEffect
              blur={60}
              variant="default"
              disabled={false}
              proximity={20}
              movementDuration={2}
              spread={15}
              borderWidth={1.5}
            />
          </div>
          <div>
            <h2 className="font-medium text-white text-base">{personality.name}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
            onClick={handleLogout}
          >
            <X className="h-3.5 w-3.5" />
            <span>退出</span>
          </button>
          <button
            className="text-white/60 hover:text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>

        {showSettings && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowSettings(false)}
            />
            <div className="absolute right-4 top-14 bg-[#1a1a1a]/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 py-2 w-48 z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-xs text-white/40">设置</p>
              </div>
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  setShowSettings(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center justify-between text-white/80"
              >
                <span>语音功能</span>
                <span className={`font-medium ${voiceEnabled ? 'text-green-400' : 'text-white/40'}`}>
                  {voiceEnabled ? '开启' : '关闭'}
                </span>
              </button>
              <button
                onClick={() => {
                  clearConversation();
                  setShowSettings(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center space-x-2 text-white/80"
              >
                <Trash2 className="h-4 w-4 text-white/60" />
                <span>清除对话</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center space-x-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-0 py-4">
        {groupedMessages().map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex justify-center mb-4">
              <span className="text-xs text-white/40 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full">
                {group.time}
              </span>
            </div>
            
            {group.messages.map((message) => (
              <MessageBubble key={message.id} message={message} personality={personality} />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isGeneratingMedia && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-white/40 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-2 rounded-full flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {isGeneratingMedia === 'video' && '正在搜索视频素材...'}
                {isGeneratingMedia === 'image' && '正在生成图片...'}
                {isGeneratingMedia === 'voice' && '正在生成语音...'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10 px-3 py-2">
        <div className="relative">
          <div className="flex items-end space-x-2">
            <input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              disabled={isStreaming}
              className="flex-1 border-none bg-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isStreaming}
              className="bg-[#07C160] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06AD56] transition-colors"
            >
              发送
            </button>
          </div>
          <GlowingEffect
            blur={80}
            variant="default"
            disabled={false}
            proximity={30}
            movementDuration={2}
            spread={20}
            borderWidth={1.5}
          />
        </div>
      </div>
    </div>
  );
}
