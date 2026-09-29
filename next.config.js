/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }, {
      // Only the synthetic public demo may be framed by another HTTPS website.
      source: '/business/embed',
      headers: [
        { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors https:; form-action 'self'" },
      ],
    }, {
      source: '/((?!business/embed(?:/|$)).*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" },
      ],
    }];
  },
};
module.exports = nextConfig;
