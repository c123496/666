/* ==================== 昵称输入组件 ==================== */

'use client';

import { useEffect } from 'react';

interface NicknameInputProps {
  onComplete: (nickname: string) => void;
  onBack: () => void;
}

export function NicknameInput({ onComplete, onBack }: NicknameInputProps) {
  const handleNicknameComplete = (nickname: string) => {
    try {
      localStorage.setItem('user_nickname', nickname);
    } catch (error) {
      console.error('保存昵称失败:', error);
    }
    onComplete(nickname);
  };

  // 组件加载时自动聚焦输入框
  useEffect(() => {
    const input = document.getElementById('nickname-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      {/* 背景装饰 - 延续首页风格 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 紫色光晕 */}
        <div className="absolute right-[-20%] top-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/40 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-pink-500/40 blur-[100px]" />
        <div className="absolute left-[20%] top-[30%] w-[30%] h-[30%] rounded-full bg-blue-500/30 blur-[80px]" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 顶部小标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <span className="text-sm text-white/60 tracking-wide">虚拟男友体验</span>
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              在开始之前，
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              想先记住你的名字
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light">
            一个称呼，会决定我们之间的距离。
          </p>

          {/* 输入框区域 */}
          <div className="space-y-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                id="nickname-input"
                placeholder="输入一个想被他记住的名字"
                className="w-full px-6 py-5 bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-2xl text-white text-lg placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all duration-300"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = document.getElementById('nickname-input') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleNicknameComplete(input.value.trim());
                    }
                  }
                }}
              />
              {/* 输入框光晕效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl opacity-0 pointer-events-none transition-opacity duration-300 peer-focus-within:opacity-100" />
            </div>

            {/* 主按钮 */}
            <button
              onClick={() => {
                const input = document.getElementById('nickname-input') as HTMLInputElement;
                if (input.value.trim()) {
                  handleNicknameComplete(input.value.trim());
                }
              }}
              className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl mx-auto"
            >
              继续进入专属聊天 →
            </button>

            {/* 返回按钮 */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </button>
          </div>

          {/* 底部小提示 */}
          <p className="text-sm text-white/30 leading-relaxed max-w-md mx-auto pt-8">
            他会用这个称呼，慢慢靠近你
          </p>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
