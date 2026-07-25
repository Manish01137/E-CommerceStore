import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify only injects COMMIT_REF at build time, not into the Functions
  // runtime — this bakes it into the server bundle so /api/health can still
  // report it at request time. See src/app/api/health/route.ts.
  env: {
    COMMIT_REF: process.env.COMMIT_REF ?? "",
  },
};

export default nextConfig;
