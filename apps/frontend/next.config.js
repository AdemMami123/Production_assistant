/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Don't fail build on ESLint errors (warnings will still show)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors during production build
    // Remove this after fixing all TypeScript issues
    ignoreBuildErrors: false,
  },
  output: 'standalone', // Required for Docker deployment
  transpilePackages: ['@productivity-assistant/shared'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig
