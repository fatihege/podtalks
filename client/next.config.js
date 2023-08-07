/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        API_URL: 'http://localhost:3001/api',
        CDN_URL: 'http://localhost:3001/api/uploads',
        WS_URL: 'http://localhost:3001',
        PP_MAXSIZE: 5000000,
        AP_MAXSIZE: 5000000,
        AUDIO_MAXSIZE: 15000000,
    }
}

module.exports = nextConfig
