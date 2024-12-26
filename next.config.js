/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "vercel.com",
      "hearthful.family"
    ],
  },
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;
