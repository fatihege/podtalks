/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        API_URL: 'http://localhost:3001',
        IMAGE_CDN: 'http://localhost:3001/image',
    }
}

module.exports = nextConfig
