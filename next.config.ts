import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Only use standalone when building for Docker
    output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jutge.org',
                port: '',
                pathname: '/**',
                search: '',
            },
        ],
    },
}

export default nextConfig
