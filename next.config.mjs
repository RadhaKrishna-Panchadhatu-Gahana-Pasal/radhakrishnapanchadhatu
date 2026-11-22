export default {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Enables instrumentation.ts, which loads the saved store (Postgres or the
    // local JSON file) once per server start before the first request.
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
