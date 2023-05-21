const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['img.shields.io'],
  }
}

module.exports = nextConfig
