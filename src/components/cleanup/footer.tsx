'use client';

import { Link } from 'lucide-react';

const footerLinks = {
  product: [
    { name: '功能介绍', href: '#features' },
    { name: '定价', href: '#pricing' },
    { name: 'API 文档', href: '#api' },
    { name: '使用教程', href: '#tutorials' },
  ],
  company: [
    { name: '关于我们', href: '#about' },
    { name: '博客', href: '#blog' },
    { name: '联系我们', href: '#contact' },
    { name: '加入我们', href: '#careers' },
  ],
  legal: [
    { name: '隐私政策', href: '#privacy' },
    { name: '服务条款', href: '#terms' },
    { name: 'Cookie 政策', href: '#cookies' },
    { name: 'GDPR', href: '#gdpr' },
  ],
  resources: [
    { name: '帮助中心', href: '#help' },
    { name: '社区', href: '#community' },
    { name: '状态页面', href: '#status' },
    { name: '更新日志', href: '#changelog' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* 品牌 */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">
              Cleanup.pictures
            </h3>
            <p className="text-gray-400 mb-6">
              用 AI 技术让图片处理变得简单高效
            </p>
            <div className="flex gap-4">
              {['Twitter', 'GitHub', 'Discord'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Link className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h4 className="font-semibold text-white mb-4">产品</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司链接 */}
          <div>
            <h4 className="font-semibold text-white mb-4">公司</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 法律链接 */}
          <div>
            <h4 className="font-semibold text-white mb-4">法律</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 资源链接 */}
          <div>
            <h4 className="font-semibold text-white mb-4">资源</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部 */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Cleanup.pictures. 保留所有权利。
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              隐私设置
            </a>
            <a href="#" className="hover:text-white transition-colors">
              语言选择
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
