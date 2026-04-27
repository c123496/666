'use client';

import { useState } from 'react';

/**
 * 开发测试页面 - 测试欢迎邮件发送
 * URL: /dev/test-email
 *
 * 仅用于开发环境测试 Resend 邮件配置
 */
export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean | null;
    message: string;
    data?: any;
    error?: string;
  }>({ success: null, message: '' });

  const handleTest = async () => {
    if (!email.trim()) {
      setResult({
        success: false,
        message: '请输入邮箱地址',
      });
      return;
    }

    setLoading(true);
    setResult({ success: null, message: '发送中...' });

    console.log('\n========================================');
    console.log('测试欢迎邮件发送');
    console.log('========================================');
    console.log('目标邮箱:', email);
    console.log('请求接口: POST /api/test-welcome-email');
    console.log('========================================\n');

    try {
      const response = await fetch('/api/test-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      console.log('响应状态码:', response.status);
      console.log('响应状态:', response.statusText);

      const data = await response.json();
      console.log('响应数据:', data);

      console.log('\n========================================');
      console.log('请求完成');
      console.log('========================================\n');

      setResult({
        success: response.ok,
        message: data.message || data.error || '未知错误',
        data: data.data,
        error: data.error,
      });
    } catch (error: any) {
      console.error('请求失败:', error);
      console.error('错误消息:', error.message);

      setResult({
        success: false,
        message: '网络请求失败',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4 py-12">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-20%] top-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/40 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-pink-500/40 blur-[100px]" />
      </div>

      {/* 测试卡片 */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">📧 测试欢迎邮件</h1>
            <p className="text-white/60">开发环境专用 - 测试 Resend 邮件发送</p>
          </div>

          {/* 输入框 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              已注册用户的邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="billycui134@gmail.com"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/80 focus:bg-white/10 transition-all"
              disabled={loading}
            />
            <p className="text-xs text-white/40 mt-2">
              提示：请输入已注册的邮箱地址（系统会查询用户是否存在）
            </p>
          </div>

          {/* 测试按钮 */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '发送中...' : '📨 发送测试邮件'}
          </button>

          {/* 结果显示 */}
          {result.message && (
            <div className={`mt-6 p-4 rounded-xl border ${
              result.success === true
                ? 'bg-green-500/10 border-green-500/20'
                : result.success === false
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-blue-500/10 border-blue-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success === true && (
                  <span className="text-2xl">✅</span>
                )}
                {result.success === false && (
                  <span className="text-2xl">❌</span>
                )}
                {result.success === null && (
                  <span className="text-2xl">⏳</span>
                )}
                <span className={`font-semibold ${
                  result.success === true
                    ? 'text-green-400'
                    : result.success === false
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`}>
                  {result.success === true ? '发送成功' : result.success === false ? '发送失败' : '处理中'}
                </span>
              </div>

              <p className={`text-sm mb-3 ${
                result.success === true
                  ? 'text-green-300'
                  : result.success === false
                  ? 'text-red-300'
                  : 'text-blue-300'
              }`}>
                {result.message}
              </p>

              {/* 详细信息（开发环境） */}
              {result.data && (
                <div className="mt-3 p-3 bg-black/20 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">详细信息：</p>
                  <pre className="text-xs text-white/80 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {result.error && (
                <div className="mt-3 p-3 bg-black/20 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">错误信息：</p>
                  <p className="text-xs text-red-300 break-words">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl">
            <h3 className="text-sm font-semibold text-white/80 mb-2">📖 使用说明</h3>
            <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
              <li>输入已注册用户的邮箱地址</li>
              <li>点击"发送测试邮件"按钮</li>
              <li>系统会查询用户是否存在</li>
              <li>如果用户存在，会发送欢迎邮件</li>
              <li>检查邮箱（包括垃圾邮件文件夹）</li>
            </ol>
          </div>

          {/* 快捷按钮 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEmail('billycui134@gmail.com')}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-all"
              disabled={loading}
            >
              使用测试邮箱
            </button>
            <button
              onClick={() => setResult({ success: null, message: '' })}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-all"
              disabled={loading}
            >
              清空结果
            </button>
          </div>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
