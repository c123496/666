/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ark-acg-cn-beijing.tos-cn-beijing.volces.com',
        pathname: '/**',
      },
    ],
  },
  // 暂时禁用 Turbopack，使用 webpack
  experimental: {
    turbo: undefined,
  },
};

module.exports = nextConfig;
