// next.config.mjs
import withPWA from 'next-pwa';

const nextConfig = {
  // Your Next.js configuration options here
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})(nextConfig);