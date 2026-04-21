'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GameRecord {
  id: number;
  scenario: string;
  finalScore: number;
  result: string;
  playedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 角色名称映射
  const ROLE_NAMES: Record<string, string> = {
    ceo: '霸总',
    sweet: '暖男',
    actor: '浪漫演员',
    striver: '奋斗青年',
  };

  useEffect(() => {
    // 检查登录状态并获取记录
    const fetchData = async () => {
      try {
        // 检查登录
        const meResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!meResponse.ok) {
          router.push('/login');
          return;
        }

        const meData = await meResponse.json();
        setIsLoggedIn(true);

        // 优先显示昵称，其次显示角色名，最后显示邮箱
        if (meData.user.nickname) {
          setDisplayName(meData.user.nickname);
        } else if (meData.user.selectedRole) {
          setDisplayName(ROLE_NAMES[meData.user.selectedRole] || meData.user.email);
          setSelectedRole(meData.user.selectedRole);
        } else {
          setDisplayName(meData.user.email);
        }

        // 获取游戏记录
        const recordsResponse = await fetch('/api/game-records/list', {
          credentials: 'include',
        });
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          setRecords(recordsData.records);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getResultBadge = (result: string) => {
    if (result === '通关') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010-1.414l-8 8a1 1 0 01-1.414 0l-8 8a1 1 0 111.414 1.414l8-8a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          通关
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        失败
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] px-4 py-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-20%] top-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/40 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-pink-500/40 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
          <p className="text-white/60">欢迎，{displayName}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">{records.length}</div>
            <div className="text-sm text-white/60">总游戏次数</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {records.filter(r => r.result === '通关').length}
            </div>
            <div className="text-sm text-white/60">通关次数</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {records.length > 0
                ? Math.round(records.reduce((sum, r) => sum + r.finalScore, 0) / records.length)
                : 0}
            </div>
            <div className="text-sm text-white/60">平均分数</div>
          </div>
        </div>

        {/* 游戏记录列表 */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">历史记录</h2>
          </div>

          {records.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5a2 2 0 012 2v14a2 2 0 01-2 2h-2.5a2 2 0 01-2-2V9a2 2 0 012-2h2.5a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40 mb-4">还没有游戏记录</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-lg text-sm hover:opacity-90 transition-all"
              >
                开始游戏
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {records.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium">{record.scenario}</h3>
                        {getResultBadge(record.result)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{formatDate(record.playedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(record.finalScore)}`}>
                        {record.finalScore}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">好感度</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </button>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
