import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@tabler/icons-react"],
  },
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        destination: "https://a1-supabase-mmanassov89-mmanassov89.dedicatedapp.alem.ai/:path*",
      },
    ];
  },
};

export default nextConfig;
