/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    distDir: process.env.BUILD,
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '136.158.92.61',
                port: '8081',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
