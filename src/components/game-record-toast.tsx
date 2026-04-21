'use client';

import { useEffect } from 'react';

interface GameRecordToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'prompt';
  onClose?: () => void;
  onAction?: () => void;
}

export function GameRecordToast({ show, message, type, onClose, onAction }: GameRecordToastProps) {
  useEffect(() => {
    if (show && type === 'success') {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="bg-[#030303]/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 m-4 max-w-sm pointer-events-auto shadow-2xl">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            {type === 'success' ? (
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010-1.414l-8 8a1 1 0 01-1.414 0l-8 8a1 1 0 111.414 1.414l8-8a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1-8a1 1 0 00-2 0 1 1 0 012 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h3a1 1 0 001-1V9a1 1 0 100-2zm1-5a1 1 0 100-2h.01a1 1 0 100 2H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">{message}</p>
            {type === 'prompt' && onAction && (
              <button
                onClick={onAction}
                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                去登录 →
              </button>
            )}
          </div>

          {/* 关闭按钮 */}
          {type === 'prompt' && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
