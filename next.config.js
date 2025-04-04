/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules', '**/.git'],
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://port-0-extenpy-m5qc5rxya698f4a3.sel4.cloudtype.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;