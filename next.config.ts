import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "styles")],
  },
};

export default nextConfig;
