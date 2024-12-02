/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    distDir: 'build',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '136.158.92.61',
                port: '8082',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
