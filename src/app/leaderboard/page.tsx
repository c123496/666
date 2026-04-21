'use client';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-20%] top-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/40 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-pink-500/40 blur-[100px]" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
          {/* 奖杯图标 */}
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-white mb-3">
            排行榜
          </h1>

          {/* 描述 */}
          <p className="text-white/60 mb-8">
            敬请期待，精彩内容即将上线...
          </p>

          {/* 装饰线条 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* 功能预告 */}
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">互动排行榜</h3>
                <p className="text-white/50 text-sm">查看最受欢迎的虚拟男友</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">活跃用户榜</h3>
                <p className="text-white/50 text-sm">发现最活跃的用户</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">成就系统</h3>
                <p className="text-white/50 text-sm">解锁专属徽章和称号</p>
              </div>
            </div>
          </div>

          {/* 返回按钮 */}
          <button
            onClick={() => window.history.back()}
            className="mt-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            返回上一页
          </button>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
