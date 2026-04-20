/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用 Turbopack，使用传统 Webpack
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
