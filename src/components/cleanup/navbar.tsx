'use client';

import { Link } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：品牌 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M16 4L9 11L4 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 8L13 15L8 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-black">Cleanup.pictures</span>
            <span className="text-sm text-gray-500 hidden sm:inline">by Clipdrop</span>
          </div>

          {/* 右侧：导航链接 */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#use-cases" className="text-gray-700 hover:text-black transition-colors">
                Use cases
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-black transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-gray-700 hover:text-black transition-colors">
                FAQ
              </a>
              <a href="#api" className="text-gray-700 hover:text-black transition-colors">
                API
              </a>
            </div>

            {/* Other tools 按钮 */}
            <button className="w-10 h-10 rounded-full bg-[#C6FF00] text-black font-semibold text-sm hover:bg-[#B3EF00] transition-colors flex items-center justify-center">
              Other tools
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
