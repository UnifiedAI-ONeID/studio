/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
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
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: !isProduction,
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith('/_next/static/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: ({ url }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith('/_next/image'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: ({ url }) =>
        url.origin === self.location.origin &&
        (url.pathname.startsWith('/icons/') ||
          url.pathname.startsWith('/manifest.json')),
      handler: 'CacheFirst',
      options: {
        cacheName: 'app-icons-manifest',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst', // 🔧 changed from StaleWhileRevalidate
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 4, // allowed with NetworkFirst
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern:
        /^https:\/\/(images\.unsplash\.com|picsum\.photos|i\.pravatar\.cc|lh3\.googleusercontent\.com)\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'remote-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

module.exports = withPWA(nextConfig);
