/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // 性能优化
  swcMinify: true,
  compress: true,
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
