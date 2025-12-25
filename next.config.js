/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['@xenova/transformers', 'pdf-parse'],

  // Empty turbopack config to use Turbopack (default in Next.js 16)
  turbopack: {},
};

module.exports = nextConfig;
