/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      // Docker 환경에서 파일 변경 감지를 위한 설정
      config.watchOptions = {
        poll: 1000, // 폴링 간격을 밀리초 단위로 설정
        aggregateTimeout: 300, // 변경 사항을 집계할 시간(밀리초)
        ignored: ['**/node_modules', '**/.git'],
      };
      return config;
    },
  };
  
  module.exports = nextConfig;