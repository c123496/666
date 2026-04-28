'use client';

import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 左侧：版权信息 */}
          <div className="text-center md:text-left">
            <p className="text-white/60 text-sm">
              © 2026 纸片人男友. 保留所有权利.
            </p>
          </div>

          {/* 右侧：联系我们 */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <a
              href="mailto:billycui134@gmail.com"
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center gap-2"
            >
              有问题？联系我们
              <span className="text-white/60">billycui134@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
