import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sanity CDN — serves all uploaded images
      { hostname: 'cdn.sanity.io' },
    ],
  },
};

export default nextConfig;
