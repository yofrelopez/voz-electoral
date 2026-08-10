import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/og/candidato/:id.png',
        destination: '/candidato/:id/opengraph-image',
      },
    ]
  },
};

export default nextConfig;
