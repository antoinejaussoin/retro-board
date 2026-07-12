const { i18n } = require('./next-i18next.config')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    qualities: [30, 50, 75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
    ],
  },
}

module.exports = nextConfig
