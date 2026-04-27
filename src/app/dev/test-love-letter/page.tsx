'use client';

import { useState } from 'react';

/**
 * 开发测试页面 - 测试每日情书发送
 * URL: /dev/test-love-letter
 */
export default function TestLoveLetterPage() {
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

    try {
      const response = await fetch('/api/test-love-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: data.message || data.error || '未知错误',
        data: data.data,
        error: data.error,
      });
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 px-4 py-12">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-indigo-200/20 blur-3xl" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-10%] top-[-10%] w-[40%] h-[40%] rounded-full bg-pink-300/40 blur-[80px]" />
        <div className="absolute left-[-10%] bottom-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/40 blur-[80px]" />
      </div>

      {/* 测试卡片 */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💕</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              每日情书测试
            </h1>
            <p className="text-gray-600">给你的TA发一封温暖的情书</p>
          </div>

          {/* 输入框 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              已注册用户的邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="billycui134@gmail.com"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              disabled={loading}
            />
          </div>

          {/* 发送按钮 */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-abled disabled:hover:scale-100 shadow-lg"
          >
            {loading ? '发送中...' : '💌 发送情书'}
          </button>

          {/* 结果显示 */}
          {result.message && (
            <div className={`mt-6 p-4 rounded-xl border ${
              result.success === true
                ? 'bg-pink-50 border-pink-200'
                : result.success === false
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success === true && <span className="text-2xl">💕</span>}
                {result.success === false && <span className="text-2xl">💔</span>}
                <span className={`font-semibold ${
                  result.success === true ? 'text-pink-600' : result.success === false ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {result.success === true ? '发送成功' : result.success === false ? '发送失败' : '处理中'}
                </span>
              </div>

              <p className={`text-sm mb-3 ${
                result.success === true ? 'text-pink-700' : result.success === false ? 'text-red-700' : 'text-blue-700'
              }`}>
                {result.message}
              </p>

              {result.data && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">详细信息：</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {result.error && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-xs text-red-800 break-words">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 说明 */}
          <div className="mt-6 p-4 bg-white/30 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📖 功能说明</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>输入已注册用户的邮箱地址</li>
              <li>系统会生成一封温暖的情书</li>
              <li>每天不同的情书内容</li>
              <li>检查邮箱（包括垃圾邮件文件夹）</li>
            </ul>
          </div>

          {/* 快捷按钮 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEmail('billycui134@gmail.com')}
              className="flex-1 px-3 py-2 bg-white/40 hover:bg-white/60 border border-white/30 rounded-lg text-xs text-gray-600 transition-all"
              disabled={loading}
            >
              使用测试邮箱
            </button>
            <button
              onClick={() => setResult({ success: null, message: '' })}
              className="flex-1 px-3 py-2 bg-white/40 hover:bg-white/60 border border-white/30 rounded-lg text-xs text-gray-600 transition-all"
              disabled={loading}
            >
              清空结果
            </button>
          </div>

          {/* 返回链接 */}
          <div className="mt-6 text-center space-y-2">
            <a
              href="/dev/test-email"
              className="inline-block text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              📧 测试欢迎邮件
            </a>
            <br />
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:text-gray-800 hover:bg-white/60 transition-all text-sm font-medium"
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
