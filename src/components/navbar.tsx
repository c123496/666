'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 角色名称映射
const ROLE_NAMES: Record<string, string> = {
  ceo: '霸总',
  sweet: '暖男',
  actor: '浪漫演员',
  striver: '奋斗青年',
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 检查登录状态
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);

        // 优先显示昵称，其次显示角色名，最后显示邮箱前缀
        if (data.user.nickname) {
          setDisplayName(data.user.nickname);
        } else if (data.user.selectedRole) {
          setDisplayName(ROLE_NAMES[data.user.selectedRole] || data.user.email.split('@')[0]);
        } else {
          // 显示邮箱前缀作为默认
          setDisplayName(data.user.email.split('@')[0]);
        }
      } else {
        setIsLoggedIn(false);
        setDisplayName('');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setIsLoggedIn(false);
      setDisplayName('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]); // 路由变化时重新检查登录状态

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setDisplayName('');
      router.push('/');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / 品牌名称 */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-white/80 transition-colors"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
                虚拟男友
              </span>
            </button>
          </div>

          {/* 中间区域 - 导航入口 */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/leaderboard')}
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              排行榜
            </button>
            {isLoggedIn && (
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人中心
              </button>
            )}
          </div>

          {/* 右侧区域 - 登录状态相关按钮 */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
            ) : isLoggedIn ? (
              /* 已登录状态 */
              <>
                <span className="text-sm text-white/60">
                  欢迎,
                  <span className="text-white font-medium ml-1">{displayName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                >
                  退出登录
                </button>
              </>
            ) : (
              /* 未登录状态 */
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                >
                  登录
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-500 to-rose-500 hover:opacity-90 rounded-lg transition-all"
                >
                  注册
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
