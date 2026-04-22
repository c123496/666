'use client';

import { useEffect, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function TestTurnstilePage() {
  const [envInfo, setEnvInfo] = useState({
    siteKey: '',
    siteKeyExists: false,
    siteKeyLength: 0,
    isClient: false,
    nodeEnv: '',
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 只在客户端执行
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
    setEnvInfo({
      siteKey,
      siteKeyExists: !!siteKey,
      siteKeyLength: siteKey.length,
      isClient: true,
      nodeEnv: process.env.NODE_ENV || 'unknown',
    });

    // 打印到控制台
    console.log('=== Turnstile 环境变量诊断 ===');
    console.log('NEXT_PUBLIC_TURNSTILE_SITE_KEY:', siteKey);
    console.log('是否存在:', !!siteKey);
    console.log('长度:', siteKey.length);
    console.log('Node环境:', process.env.NODE_ENV);
    console.log('是否客户端:', typeof window !== 'undefined');
    console.log('========================');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Turnstile 环境变量诊断</h1>

        {/* 环境信息 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-bold mb-4">📊 环境变量状态</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>客户端:</span>
              <span className={envInfo.isClient ? 'text-green-400' : 'text-red-400'}>
                {envInfo.isClient ? '✅ 是' : '❌ 否'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Node 环境:</span>
              <span className="text-yellow-400">{envInfo.nodeEnv}</span>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_TURNSTILE_SITE_KEY 存在:</span>
              <span className={envInfo.siteKeyExists ? 'text-green-400' : 'text-red-400'}>
                {envInfo.siteKeyExists ? '✅ 是' : '❌ 否'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Site Key 长度:</span>
              <span className="text-blue-400">{envInfo.siteKeyLength} 字符</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Site Key 值:</div>
              <div className="text-xs p-2 bg-gray-900 rounded break-all">
                {envInfo.siteKey || 'undefined'}
              </div>
            </div>
          </div>
        </div>

        {/* Turnstile 测试 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-purple-500">
          <h2 className="text-xl font-bold mb-4">🧪 Turnstile 组件测试</h2>

          {!envInfo.siteKeyExists ? (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded">
              <div className="font-bold mb-2">❌ NEXT_PUBLIC_TURNSTILE_SITE_KEY 未定义</div>
              <div className="text-sm">
                请在 .env.local 文件中添加以下内容：
                <pre className="mt-2 p-2 bg-black/30 rounded text-xs">
                  NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADBK-6FEmTQHUZtg
                </pre>
                <div className="mt-2 text-orange-300 text-xs">
                  ⚠️ 添加后请重启开发服务器（Ctrl+C 然后 pnpm run dev）
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center py-8">
                <Turnstile
                  siteKey={envInfo.siteKey}
                  onSuccess={(token) => {
                    console.log('[Test] Token received:', !!token);
                    setTurnstileToken(token);
                    setError('');
                  }}
                  onError={() => {
                    console.error('[Test] Turnstile error');
                    setError('Turnstile 验证失败');
                    setTurnstileToken(null);
                  }}
                  onExpire={() => {
                    console.log('[Test] Token expired');
                    setTurnstileToken(null);
                  }}
                />
              </div>

              {turnstileToken && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded mt-4">
                  ✅ Turnstile 验证成功！Token 已接收（长度: {turnstileToken.length}）
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded mt-4">
                  ❌ {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500">
          <h2 className="text-xl font-bold mb-4">📖 使用说明</h2>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-bold text-yellow-400 mb-2">1️⃣ 检查 .env.local 文件</div>
              <div className="text-gray-300">
                确保项目根目录的 .env.local 文件包含：
                <pre className="mt-2 p-2 bg-gray-900 rounded text-xs">
                  NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADBK-6FEmTQHUZtg
                  TURNSTILE_SECRET_KEY=0x4AAAAAADBK-3wIQsNxCHnEH_O8NNt3YwE
                </pre>
              </div>
            </div>

            <div>
              <div className="font-bold text-yellow-400 mb-2">2️⃣ 重启开发服务器</div>
              <div className="text-gray-300">
                修改 .env.local 后必须重启：
                <pre className="mt-2 p-2 bg-gray-900 rounded text-xs">
                  1. 在终端按 Ctrl+C 停止服务器
                  2. 运行 pnpm run dev 重新启动
                </pre>
              </div>
            </div>

            <div>
              <div className="font-bold text-yellow-400 mb-2">3️⃣ 检查浏览器控制台</div>
              <div className="text-gray-300">
                打开浏览器开发者工具（F12），查看 Console 标签页的日志输出
              </div>
            </div>

            <div>
              <div className="font-bold text-yellow-400 mb-2">4️⃣ 常见问题</div>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>如果 Site Key 显示 undefined：检查 .env.local 文件名和格式</li>
                <li>如果 Turnstile 不显示：检查网络连接，可能被防火墙阻止</li>
                <li>如果一直验证中：清除浏览器缓存和 cookie</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-8 text-center">
          <a
            href="http://localhost:5000"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors mr-4"
          >
            返回首页 (localhost:5000)
          </a>
          <a
            href="http://localhost:5000/register"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            注册页面
          </a>
        </div>
      </div>
    </div>
  );
}
