/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Required for Docker deployment
  transpilePackages: ['@productivity-assistant/shared'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig
