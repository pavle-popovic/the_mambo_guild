import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Proxy client-side /api/* requests through Vercel to the Railway backend.
  // This makes cookies same-origin (set on the Vercel domain) so they persist
  // across page refreshes. Server-side code (middleware) uses API_DIRECT_URL
  // to call Railway directly.
  async rewrites() {
    const backendUrl = process.env.API_DIRECT_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
