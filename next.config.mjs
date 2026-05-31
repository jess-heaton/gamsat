/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint is intentionally not a dependency (its transitive `glob` carried a
  // dev-only advisory). Don't attempt to lint during `next build`.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
