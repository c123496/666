'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { UserConfigManager } from '@/lib/storage';
import { Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
  showNicknameStep?: boolean;
}

export default function WelcomeScreen({ onComplete, showNicknameStep = true }: WelcomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNicknameSubmit = () => {
    if (nickname.trim()) {
      UserConfigManager.setNickname(nickname.trim());
      onComplete(); // 调用父组件的回调
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 动态渐变背景 - 现在透明以显示HeroGeometric背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent/50" />
      
      {/* 浮动光斑 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
      </div>
      
      {/* 星星粒子 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 主内容区 */}
      <div className={`relative z-10 flex min-h-screen flex-col items-center justify-center p-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-full max-w-lg space-y-8">
          {/* Logo区域 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-400/30 blur-3xl rounded-full scale-150" />
              <Heart className="relative h-16 w-16 text-pink-400 animate-pulse" fill="currentColor" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                虚拟男友
              </h1>
              <p className="text-white/60 text-sm tracking-wide">你的专属情感陪伴</p>
            </div>
          </div>

          {/* 毛玻璃卡片 */}
          <div className="relative">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-medium text-white">你好呀</h2>
                  <p className="text-white/50 text-sm">告诉我怎么称呼你吧~</p>
                </div>

                <div className="relative">
                  <Input
                    placeholder="输入你的昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                    className="h-14 px-6 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl focus:bg-white/20 focus:border-pink-400/50 focus:ring-pink-400/30 transition-all"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl rounded-2xl" />
                </div>

                <Button
                  onClick={handleNicknameSubmit}
                  disabled={!nickname.trim()}
                  className="w-full h-14 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-400 hover:via-rose-400 hover:to-purple-400 text-white font-medium rounded-2xl shadow-lg shadow-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/40 disabled:opacity-50 disabled:shadow-none"
                >
                  开始选择
                </Button>
              </div>
            </div>
            <GlowingEffect
              blur={100}
              variant="default"
              disabled={false}
              proximity={30}
              movementDuration={1.5}
              spread={30}
              borderWidth={2}
            />
          </div>
        </div>
      </div>

      {/* CSS动画 */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -30px) scale(1.1); }
          50% { transform: translate(100px, 0) scale(1); }
          75% { transform: translate(50px, 30px) scale(0.9); }
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #f472b6, #c084fc);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          top: 50%;
          right: -50px;
          animation-delay: -5s;
        }
        
        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          bottom: -100px;
          left: 20%;
          animation-delay: -10s;
        }
        
        .orb-4 {
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          top: 30%;
          left: 10%;
          animation-delay: -15s;
        }
        
        .orb-5 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #fb7185, #f472b6);
          bottom: 20%;
          right: 20%;
          animation-delay: -8s;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .star {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
