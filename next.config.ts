import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Disable SSL verification for development with self-signed certificates
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default nextConfig;
