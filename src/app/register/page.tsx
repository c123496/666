'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证 Turnstile token
    if (!turnstileToken) {
      setError('请完成人机验证');
      return;
    }

    // 前端验证
    if (!formData.username || !formData.password) {
      setError('请填写所有字段');
      return;
    }

    if (formData.username.length < 3) {
      setError('用户名长度不能少于3个字符');
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败');
        return;
      }

      // 注册成功，跳转到首页
      router.push('/');
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4">
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
            <h1 className="text-3xl font-bold text-white mb-2">注册账号</h1>
            <p className="text-white/60">加入哄哄模拟器</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="请输入用户名（3-50个字符）"
                disabled={loading}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                密码
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="请输入密码（至少6个字符）"
                disabled={loading}
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
                placeholder="请再次输入密码"
                disabled={loading}
              />
            </div>

            {/* Turnstile 验证 */}
            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => {
                  setTurnstileToken(token);
                }}
                onError={() => {
                  setError('人机验证失败，请刷新页面重试');
                  setTurnstileToken(null);
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
              />
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center text-sm text-white/60">
            已有账号？
            <button
              onClick={() => router.push('/login')}
              className="text-purple-400 hover:text-purple-300 font-medium ml-1"
            >
              立即登录
            </button>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-6 text-center">
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
