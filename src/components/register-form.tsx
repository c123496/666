/* ==================== 注册表单组件 ==================== */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

interface RegisterFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function RegisterForm({ onSuccess, onBack }: RegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [siteKey, setSiteKey] = useState<string>('');

  // 只在客户端初始化 site key
  useEffect(() => {
    setIsClient(true);
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

    // 开发环境：打印详细调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Turnstile 环境变量诊断（RegisterForm）===');
      console.log('是否客户端:', typeof window !== 'undefined');
      console.log('NEXT_PUBLIC_TURNSTILE_SITE_KEY:', key);
      console.log('Site Key 存在:', !!key);
      console.log('Site Key 长度:', key.length);
      console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
      console.log('=========================================');
    }

    setSiteKey(key);

    // 如果 site key 不存在，在开发环境显示警告
    if (!key && process.env.NODE_ENV === 'development') {
      console.error('❌ NEXT_PUBLIC_TURNSTILE_SITE_KEY 未定义！');
      console.error('请在 .env.local 中设置：NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的SiteKey');
      console.error('设置后请重启开发服务器（Ctrl+C 然后 pnpm run dev）');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证 Turnstile token
    if (!turnstileToken) {
      setError('请完成人机验证');
      return;
    }

    // 前端验证
    if (!formData.email || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6个字符');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      // 开发环境：打印提交的 token 状态
      if (process.env.NODE_ENV === 'development') {
        console.log('[Turnstile] 提交注册，Token 状态:', turnstileToken ? '✅ 存在' : '❌ 缺失');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败');
        return;
      }

      // 注册成功，调用回调函数
      onSuccess();
    } catch (err) {
      console.error('请求错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 服务端渲染时不显示 Turnstile
  if (!isClient) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] px-4">
        <div className="text-white/60">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-20%] top-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/40 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-pink-500/40 blur-[100px]" />
      </div>

      {/* 注册表单 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">邮箱注册</h1>
            <p className="text-white/60">创建账号，开始你的专属体验</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                邮箱地址 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="请输入邮箱地址"
                disabled={loading}
                autoFocus
                required
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                密码 <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="至少6个字符"
                disabled={loading}
                required
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                确认密码 <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="再次输入密码"
                disabled={loading}
                required
              />
            </div>

            {/* Turnstile 验证 - 添加多层保护 */}
            {siteKey ? (
              <div className="flex justify-center">
                <Turnstile
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    console.log('[Turnstile] ✅ Token 接收成功');
                    setTurnstileToken(token);
                  }}
                  onError={() => {
                    console.error('[Turnstile] ❌ 验证失败');
                    setError('人机验证失败，请刷新页面重试');
                    setTurnstileToken(null);
                  }}
                  onExpire={() => {
                    console.log('[Turnstile] ⏰ Token 过期');
                    setTurnstileToken(null);
                  }}
                />
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                <div className="font-bold mb-2">⚠️ 人机验证未配置</div>
                <div className="text-xs">
                  请在 .env.local 中添加：<br/>
                  <code className="block mt-2 p-2 bg-black/30 rounded">
                    NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADBK-6FEmTQHUZtg
                  </code>
                  <div className="mt-2 text-orange-300">
                    添加后请重启开发服务器（Ctrl+C 然后 pnpm run dev）
                  </div>
                </div>
              </div>
            )}

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '注册中...' : '注册 →'}
            </button>
          </form>

          {/* 已有账号提示 */}
          <div className="mt-6 text-center text-sm text-white/60">
            已有账号？
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-purple-400 hover:text-purple-300 font-medium ml-1"
            >
              立即登录
            </button>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
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
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
