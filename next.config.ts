import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
}

export default nextConfig

module.exports = {
    experimental: {
        turbo: {
            resolveAlias: {
                canvas: './empty-module.ts',
            },
        },
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        //        ignoreDuringBuilds: true,
    },
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
