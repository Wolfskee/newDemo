/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  basePath: isProd ? '/demo' : '',
  assetPrefix: isProd ? '/demo' : '',
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/demo' : '',
  },
}

module.exports = nextConfig
