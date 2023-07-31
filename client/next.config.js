/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        API_URL: 'http://localhost:3001/api',
        IMAGE_CDN: 'http://localhost:3001/image',
        WS_URL: 'http://localhost:3001',
        PP_MAXSIZE: 5000000,
        AP_MAXSIZE: 5000000,
    }
}

module.exports = nextConfig
