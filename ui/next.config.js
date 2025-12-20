/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://server:8080/api/:path*', // Proxy to Spring Boot server
      },
    ]
  },
}

module.exports = nextConfig
