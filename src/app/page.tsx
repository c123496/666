'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { GlowCard } from '@/components/ui/glow-card';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { RegisterForm } from '@/components/register-form';
import { NicknameInput } from '@/components/nickname-input';

// 角色数据 - 真实姓名版
const personalities = [
  {
    id: 'ceo',
    name: '顾承川',
    type: '霸道总裁',
    description: '冷静克制，事业有成，习惯用行动表达偏爱。',
    tags: ['霸道', '精英', '行动派'],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tagClass: 'tag-purple',
    glowColor: 'purple' as const,
    greeting: '终于来了，我等你很久。',
  },
  {
    id: 'sweet',
    name: '沈予安',
    type: '温柔男友',
    description: '温柔治愈，擅长倾听，总会在你情绪低落时安静陪着你。',
    tags: ['温柔', '治愈', '陪伴者'],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    tagClass: 'tag-pink',
    glowColor: 'pink' as const,
    greeting: '今天想先聊什么？我在。',
  },
  {
    id: 'actor',
    name: '陆景言',
    type: '浪漫演员',
    description: '擅长用精心编织的语言打动人心，懂得如何让你感到特别。',
    tags: ['浪漫', '表达力', '情绪价值'],
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    tagClass: 'tag-purple',
    glowColor: 'purple' as const,
    greeting: '见到你之后，今晚好像都变得更浪漫了。',
  },
  {
    id: 'striver',
    name: '周屿川',
    type: '奋斗青年',
    description: '阳光真诚，努力上进，踏实可靠，愿意陪你一步一步变好。',
    tags: ['阳光', '上进', '可靠'],
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    tagClass: 'tag-teal',
    glowColor: 'green' as const,
    greeting: '辛苦一天了吧，我陪你聊聊。',
  },
];

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'hero' | 'register' | 'welcome' | 'chat'>('hero');
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);

  // 检查用户状态（登录 + 角色选择）
  useEffect(() => {
    const checkUserState = async () => {
      try {
        // 检查登录状态
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          // 未登录，显示 hero
          setView('hero');
          return;
        }

        const data = await response.json();

        // 已登录，检查是否选择了角色
        if (data.user.selectedRole) {
          // 已选择角色，进入聊天页
          setSelectedPersonality(data.user.selectedRole);
          setView('chat');
        } else {
          // 未选择角色，跳转到角色选择页
          router.push('/select-role');
        }
      } catch (error) {
        console.error('检查用户状态失败:', error);
        setView('hero');
      }
    };

    checkUserState();
  }, []);

  const handleStart = async () => {
    // 检查登录状态
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // 已登录，检查是否已选择角色
        if (data.user.selectedRole) {
          // 已选择角色，进入聊天页
          setSelectedPersonality(data.user.selectedRole);
          setView('chat');
        } else {
          // 未选择角色，跳转到角色选择页
          router.push('/select-role');
        }
      } else {
        // 未登录，进入注册页
        setView('register');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 出错也进入注册页
      setView('register');
    }
  };

  const handlePersonalitySelect = (personalityId: string) => {
    try {
      localStorage.setItem('selected_personality', personalityId);
      localStorage.setItem('has_config', 'true');
      setSelectedPersonality(personalityId);
      setView('chat');
    } catch (error) {
      console.error('保存选择失败:', error);
      setSelectedPersonality(personalityId);
      setView('chat');
    }
  };

  const handleBackToHero = () => {
    setView('hero');
    setSelectedPersonality(null);
  };

  return (
    <>
      {/* ==================== 首页 - 几何形状 Hero ==================== */}
      {view === 'hero' && (
        <HeroGeometric
          badge="敏敏虚拟男友体验"
          title1="遇见你的"
          title2="完美男友"
          description="体验最温暖的陪伴，最贴心的关怀，最浪漫的时刻。四种不同风格，总有一款适合你。"
          onStart={handleStart}
        />
      )}

      {/* ==================== 注册页面 - 集成在流程中 ==================== */}
      {view === 'register' && (
        <RegisterForm
          onSuccess={() => router.push('/select-role')}
          onBack={() => setView('hero')}
        />
      )}

      {/* ==================== 昵称输入页 - 使用独立组件 ==================== */}
      {view === 'welcome' && <NicknameInput onComplete={() => setView('chat')} onBack={() => setView('hero')} />}

      {/* ==================== 角色选择页面 - 真实姓名版 ==================== */}
      {view === 'chat' && !selectedPersonality && (
        <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            {/* 标题 - 精致版 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-3">
                <span className="text-lg">💘</span>
                <span className="text-sm font-medium text-purple-700">选择你的专属男友</span>
              </div>
              <p className="text-muted-foreground text-sm">
                四种不同风格，哪一种最吸引你？
              </p>
            </div>

            {/* 角色卡片网格 - 真实姓名版 */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1">
              {personalities.map((personality) => (
                <GlowCard
                  key={personality.id}
                  glowColor={personality.glowColor}
                  className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  customSize={true}
                  onClick={() => handlePersonalitySelect(personality.id)}
                >
                  {/* 卡片内部内容 - 真人姓名版 */}
                  <div className="flex flex-col items-center h-full py-3">
                    {/* 真人头像 */}
                    <PersonAvatar
                      name={personality.name}
                      type={personality.type}
                      className="mb-3"
                      size="md"
                    />

                    {/* 角色姓名 - 主标题 */}
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                      {personality.name}
                    </h3>

                    {/* 角色类型 - 副标题 */}
                    <p className="text-xs md:text-sm text-muted-foreground/80 mb-2 font-medium">
                      {personality.type}
                    </p>

                    {/* 角色简介 */}
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 text-center px-1 line-clamp-2">
                      {personality.description}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {personality.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: personality.gradient.replace('135deg', 'to-right').replace('100%)', '20%)'),
                            color: personality.gradient.split(' ')[1].replace('0%,', ''),
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 底部提示 */}
                    <div className="mt-auto pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>点击开始</span>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>

            {/* 返回按钮 */}
            <div className="text-center mt-6">
              <button
                onClick={handleBackToHero}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-muted-foreground hover:text-primary hover:border-primary transition-all text-sm font-medium hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 聊天界面 ==================== */}
      {view === 'chat' && selectedPersonality && (
        <ChatInterface
          personalityId={selectedPersonality}
          onBack={handleBackToHero}
        />
      )}
    </>
  );
}
