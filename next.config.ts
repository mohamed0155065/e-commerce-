/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // النجمتين دول معناهم "اسمح بأي موقع في الكوكب"
      },
    ],
  },
};

export default nextConfig;