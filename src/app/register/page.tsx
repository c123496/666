'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

// Cloudflare 官方测试 key（仅用于开发环境）
const TESTING_SITE_KEY = '1x00000000000000000000AA';
const TESTING_SECRET_KEY = '1x0000000000000000000000000000000AA';

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
  const [isClient, setIsClient] = useState(false);
  const [siteKey, setSiteKey] = useState<string>('');
  const [turnstileError, setTurnstileError] = useState<string>('');
  const [isUsingTestKey, setIsUsingTestKey] = useState(false);

  // 只在客户端初始化 site key
  useEffect(() => {
    setIsClient(true);

    // 根据环境选择 site key
    const isProduction = process.env.NODE_ENV === 'production';
    const envSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

    let selectedSiteKey = '';
    let usingTestKey = false;

    if (isProduction && envSiteKey) {
      // 生产环境：使用正式 key
      selectedSiteKey = envSiteKey;
      usingTestKey = false;
    } else if (!isProduction) {
      // 开发环境：默认使用测试 key
      selectedSiteKey = TESTING_SITE_KEY;
      usingTestKey = true;

      console.warn('[Turnstile] 开发环境使用 Cloudflare 官方测试 key');
      console.warn('[Turnstile] 如需在本地测试正式 key，请在 Cloudflare 后台添加 localhost 域名');
    } else {
      // 生产环境但没有配置正式 key
      console.error('[Turnstile] ❌ 生产环境未配置 NEXT_PUBLIC_TURNSTILE_SITE_KEY');
    }

    setSiteKey(selectedSiteKey);
    setIsUsingTestKey(usingTestKey);

    // 开发环境：打印调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Turnstile 配置诊断 ===');
      console.log('环境:', process.env.NODE_ENV);
      console.log('是否生产环境:', isProduction);
      console.log('使用测试 key:', usingTestKey);
      console.log('Site Key:', selectedSiteKey);
      console.log('Site Key 存在:', !!selectedSiteKey);
      console.log('========================');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTurnstileError('');

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
        // 如果是 Turnstile 验证失败，清空 token
        if (response.status === 403) {
          setTurnstileToken(null);
          setTurnstileError('人机验证失败，请重新验证');
        }
        setError(data.error || '注册失败');
        return;
      }

      // 注册成功，清空 token 并跳转
      setTurnstileToken(null);
      router.push('/');
    } catch (err) {
      console.error('[注册] 请求错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 服务端渲染时不显示 Turnstile
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4">
        <div className="text-white/60">加载中...</div>
      </div>
    );
  }

  // 如果没有 site key，显示配置提示
  if (!siteKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
              <div className="font-bold mb-2">⚠️ 人机验证未配置</div>
              <div className="text-xs">
                生产环境请在 .env.local 中添加：<br/>
                <code className="block mt-2 p-2 bg-black/30 rounded">
                  NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的正式SiteKey
                </code>
                <div className="mt-2 text-orange-300">
                  添加后请重启开发服务器并重新部署
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {isUsingTestKey && process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                🔧 开发模式：使用 Cloudflare 测试 key
              </div>
            )}
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
            <div className="space-y-2">
              {turnstileError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">
                  {turnstileError}
                </div>
              )}

              <div className="flex justify-center">
                <Turnstile
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    console.log('[Turnstile] ✅ 验证成功');
                    setTurnstileToken(token);
                    setTurnstileError('');
                  }}
                  onError={(errorCode) => {
                    console.warn('[Turnstile] ⚠️ 加载失败, errorCode:', errorCode);

                    // 检测可能的 AdBlock 拦截
                    const isAdblockPossible = errorCode === '100401' || errorCode === '100402';

                    let errorMsg = '人机验证加载失败';
                    if (isAdblockPossible) {
                      errorMsg = '人机验证被拦截，请关闭广告拦截插件后刷新重试';
                    } else if (errorCode === '110000') {
                      errorMsg = '验证组件响应超时，请刷新页面重试';
                    } else if (errorCode === '300010') {
                      errorMsg = 'Turnstile 服务暂时不可用，请稍后重试';
                    } else if (errorCode === '300030') {
                      errorMsg = '验证组件参数错误，请联系管理员';
                    }

                    setTurnstileError(errorMsg);
                    setTurnstileToken(null);
                  }}
                  onExpire={() => {
                    console.log('[Turnstile] ⏰ 验证过期');
                    setTurnstileToken(null);
                    setTurnstileError('验证已过期，请重新验证');
                  }}
                />
              </div>

              {isUsingTestKey && process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 text-center">
                  💡 开发环境提示：当前使用 Cloudflare 测试 key，任何输入都会通过验证
                </div>
              )}
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
