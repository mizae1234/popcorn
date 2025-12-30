import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Trust proxy headers for HTTPS detection behind Nginx/reverse proxy
  experimental: {
    serverActions: {
      allowedOrigins: ['popcorn-creator.com', 'www.popcorn-creator.com'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

