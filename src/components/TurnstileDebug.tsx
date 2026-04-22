'use client';

import { useEffect, useState } from 'react';

/**
 * Turnstile 环境变量诊断组件
 * 用于调试 NEXT_PUBLIC_TURNSTILE_SITE_KEY 是否正确加载
 */
export function TurnstileDebug() {
  const [envInfo, setEnvInfo] = useState({
    siteKey: '',
    siteKeyExists: false,
    siteKeyLength: 0,
    isClient: false,
    nodeEnv: '',
  });

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

  if (process.env.NODE_ENV !== 'development') {
    return null; // 生产环境不显示
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      border: envInfo.siteKeyExists ? '2px solid #0f0' : '2px solid #f00',
      maxWidth: '400px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
        🔧 Turnstile 环境变量诊断
      </div>
      <div>客户端: {envInfo.isClient ? '✅' : '❌'}</div>
      <div>环境: {envInfo.nodeEnv}</div>
      <div>Site Key 存在: {envInfo.siteKeyExists ? '✅' : '❌'}</div>
      <div>Site Key 长度: {envInfo.siteKeyLength}</div>
      <div style={{ marginTop: '10px', wordBreak: 'break-all', fontSize: '10px', opacity: 0.7 }}>
        值: {envInfo.siteKey || 'undefined'}
      </div>
      {!envInfo.siteKeyExists && (
        <div style={{ marginTop: '10px', color: '#f55', fontWeight: 'bold' }}>
          ⚠️ NEXT_PUBLIC_TURNSTILE_SITE_KEY 未定义！
          <br/>请检查 .env.local 文件
        </div>
      )}
    </div>
  );
}
