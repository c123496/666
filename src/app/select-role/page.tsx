'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { GlowCard } from '@/components/ui/glow-card';

// 角色数据 - 完整版
const ROLES = [
  {
    id: 'ceo',
    name: '顾承川',
    type: '霸道总裁',
    description: '冷静克制，事业有成，习惯用行动表达偏爱。',
    tags: ['霸道', '精英', '行动派'],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glowColor: 'purple' as const,
  },
  {
    id: 'sweet',
    name: '沈予安',
    type: '温柔男友',
    description: '温柔治愈，擅长倾听，总会在你情绪低落时安静陪着你。',
    tags: ['温柔', '治愈', '陪伴者'],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glowColor: 'pink' as const,
  },
  {
    id: 'actor',
    name: '陆景言',
    type: '浪漫演员',
    description: '擅长用精心编织的语言打动人心，懂得如何让你感到特别。',
    tags: ['浪漫', '表达力', '情绪价值'],
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    glowColor: 'purple' as const,
  },
  {
    id: 'striver',
    name: '周屿川',
    type: '奋斗青年',
    description: '阳光真诚，努力上进，踏实可靠，愿意陪你一步一步变好。',
    tags: ['阳光', '上进', '可靠'],
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    glowColor: 'green' as const,
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查是否登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleConfirm = async () => {
    if (!selectedRole) {
      setError('请选择一个角色');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '选择角色失败');
        return;
      }

      // 保存角色到 localStorage 并跳转到聊天页
      try {
        localStorage.setItem('selected_personality', selectedRole);
        localStorage.setItem('has_config', 'true');
      } catch (e) {
        console.error('保存到 localStorage 失败:', e);
      }

      // 跳转到首页，会自动进入聊天页
      router.push('/');
    } catch (err) {
      console.error('选择角色错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-3">
            <span className="text-lg">💘</span>
            <span className="text-sm font-medium text-purple-700">选择你的专属男友</span>
          </div>
          <p className="text-muted-foreground text-sm">
            四种不同风格，哪一种最吸引你？
          </p>
        </div>

        {/* 角色卡片网格 */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1">
          {ROLES.map((role) => (
            <GlowCard
              key={role.id}
              glowColor={role.glowColor}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id ? 'ring-2 ring-purple-500 scale-[1.02]' : ''
              } hover:scale-[1.02] active:scale-[0.98]`}
              customSize={true}
              onClick={() => handleSelectRole(role.id)}
            >
              {/* 卡片内部内容 */}
              <div className="flex flex-col items-center h-full py-3">
                {/* 真人头像 */}
                <PersonAvatar
                  name={role.name}
                  type={role.type}
                  className="mb-3"
                  size="md"
                />

                {/* 角色姓名 */}
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                  {role.name}
                </h3>

                {/* 角色类型 */}
                <p className="text-xs md:text-sm text-muted-foreground/80 mb-2 font-medium">
                  {role.type}
                </p>

                {/* 角色简介 */}
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 text-center px-1 line-clamp-2">
                  {role.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {role.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: role.gradient.replace('135deg', 'to-right').replace('100%)', '20%)'),
                        color: role.gradient.split(' ')[1].replace('0%,', ''),
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 选中标记 */}
                {selectedRole === role.id && (
                  <div className="mt-auto pt-2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010-1.414l-8 8a1 1 0 01-1.414 0l-8 8a1 1 0 111.414 1.414l8-8a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      已选择
                    </div>
                  </div>
                )}
              </div>
            </GlowCard>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* 确认按钮 */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleConfirm}
            disabled={!selectedRole || loading}
            className="px-12 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-lg font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '保存中...' : '确认选择'}
          </button>
        </div>

        {/* 返回按钮 */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
