/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        API_URL: 'https://podtalks-server-khtelipwyq-lm.a.run.app/api',
        CDN_URL: 'https://podtalks-server-khtelipwyq-lm.a.run.app/uploads',
        WS_URL: 'https://podtalks-server-khtelipwyq-lm.a.run.app',
        PP_MAXSIZE: 5000000,
        AP_MAXSIZE: 5000000,
        AUDIO_MAXSIZE: 15000000,
    }
}

module.exports = nextConfig
