import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure webpack is used instead of Turbopack for Docker compatibility
  // Turbopack has issues with volume mounts and file watching in Docker
};

export default nextConfig;
