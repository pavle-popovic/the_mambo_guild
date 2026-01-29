import type { NextConfig } from "next";

const nextConfig = {
  // Ensure webpack is used instead of Turbopack for Docker compatibility
  // Turbopack has issues with volume mounts and file watching in Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-bad1fce3595144f2bac8492efa3aec64.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

};

export default nextConfig;
