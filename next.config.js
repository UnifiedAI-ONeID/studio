/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: !isProduction,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offline-cache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' ,
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = withPWA(nextConfig);
