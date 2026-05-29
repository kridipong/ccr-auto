import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: false, // webpack — required for cloudflared tunnel (Turbopack chunks fail through proxy)
};

export default nextConfig;
