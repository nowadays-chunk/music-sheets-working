/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const guitar = require('./config/guitar-node');

const nextConfig = {
    output: 'export',
    reactStrictMode: true
}

module.exports = nextConfig;
