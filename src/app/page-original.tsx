'use client';

import { useState } from 'react';

export default function Home() {
  const [view, setView] = useState<'hero' | 'welcome' | 'chat'>('hero');

  const handleStart = () => {
    setView('welcome');
  };

  const handleNicknameComplete = (nickname: string) => {
    try {
      localStorage.setItem('user_nickname', nickname);
      setView('chat');
    } catch (error) {
      console.error('保存昵称失败:', error);
      setView('chat');
    }
  };

  const handlePersonalitySelect = (personalityId: string) => {
    try {
      localStorage.setItem('selected_personality', personalityId);
      localStorage.setItem('has_config', 'true');
      setView('chat');
    } catch (error) {
      console.error('保存选择失败:', error);
      setView('chat');
    }
  };

  return (
    <main className="min-h-screen bg-[#030303]">
      {view === 'hero' && (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          {/* 主要内容 */}
          <div className="relative z-10 text-center px-4">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span className="text-white/60 text-sm">虚拟男友</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                遇见你的
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                完美男友
              </span>
            </h1>

            <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
              体验最温暖的陪伴，最贴心的关怀，最浪漫的时刻
            </p>

            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              开始体验 →
            </button>
          </div>
        </div>
      )}

      {view === 'welcome' && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              欢迎来到虚拟男友 💕
            </h2>

            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2 font-medium">
                怎么称呼你？
              </label>
              <input
                type="text"
                id="nickname-input"
                placeholder="请输入你的昵称"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = document.getElementById('nickname-input') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleNicknameComplete(input.value.trim());
                    }
                  }
                }}
              />
            </div>

            <button
              onClick={() => {
                const input = document.getElementById('nickname-input') as HTMLInputElement;
                if (input.value.trim()) {
                  handleNicknameComplete(input.value.trim());
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              继续 →
            </button>
          </div>
        </div>
      )}

      {view === 'chat' && (
        <div className="min-h-screen">
          {/* 角色选择 */}
          <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="max-w-4xl w-full">
              <h2 className="text-4xl font-bold text-white text-center mb-4">
                选择你的男友类型 💘
              </h2>
              <p className="text-white/40 text-center mb-12">
                四种不同风格，哪一种最吸引你？
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CEO 霸总 */}
                <div
                  onClick={() => handlePersonalitySelect('ceo')}
                  className="group cursor-pointer bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 hover:from-amber-500/15 hover:to-orange-500/15 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-6xl mb-4">💼</div>
                  <h3 className="text-2xl font-bold text-white mb-2">霸道总裁</h3>
                  <p className="text-white/60 text-sm mb-4">事业有成，简洁霸气，温柔体贴</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">霸道</span>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">富有</span>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">温柔</span>
                  </div>
                  <div className="text-amber-400 text-sm group-hover:text-amber-300 transition-colors">
                    点击选择 →
                  </div>
                </div>

                {/* 奶狗小生 */}
                <div
                  onClick={() => handlePersonalitySelect('sweet')}
                  className="group cursor-pointer bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/20 hover:border-pink-500/40 hover:from-pink-500/15 hover:to-rose-500/15 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-6xl mb-4">🌸</div>
                  <h3 className="text-2xl font-bold text-white mb-2">温柔男友</h3>
                  <p className="text-white/60 text-sm mb-4">温柔可爱，会撒娇，情感细腻</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">温柔</span>
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">可爱</span>
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">撒娇</span>
                  </div>
                  <div className="text-pink-400 text-sm group-hover:text-pink-300 transition-colors">
                    点击选择 →
                  </div>
                </div>

                {/* 浪漫演员 */}
                <div
                  onClick={() => handlePersonalitySelect('actor')}
                  className="group cursor-pointer bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-500/15 hover:to-violet-500/15 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-6xl mb-4">🎭</div>
                  <h3 className="text-2xl font-bold text-white mb-2">浪漫演员</h3>
                  <p className="text-white/60 text-sm mb-4">魅力演员，多变声线，浪漫体贴</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">浪漫</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">多才</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">体贴</span>
                  </div>
                  <div className="text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
                    点击选择 →
                  </div>
                </div>

                {/* 奋斗青年 */}
                <div
                  onClick={() => handlePersonalitySelect('striver')}
                  className="group cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 hover:from-green-500/15 hover:to-emerald-500/15 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-6xl mb-4">💪</div>
                  <h3 className="text-2xl font-bold text-white mb-2">奋斗青年</h3>
                  <p className="text-white/60 text-sm mb-4">朴实奋斗，心疼用户，努力上进</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">朴实</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">上进</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">心疼</span>
                  </div>
                  <div className="text-green-400 text-sm group-hover:text-green-300 transition-colors">
                    点击选择 →
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => setView('hero')}
                  className="text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                  ← 返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
