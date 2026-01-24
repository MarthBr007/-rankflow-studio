/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Output settings
  output: 'standalone', // Better for Vercel
  // Experimental features
  experimental: {
    // Optimize for production
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig

