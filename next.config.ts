import type { NextConfig } from 'next'
import { ROUTES } from '@/lib/helpers/routes';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const basePath =
  rawBasePath && rawBasePath !== '/'
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

const nextConfig: NextConfig = {
  basePath,
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: false,
  productionBrowserSourceMaps: false,
  rewrites: async () => {
    return [
      {
        source: ROUTES.HOME,
        destination: ROUTES.APP.DASHBOARD,
      },
    ]
  },
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    // Loading (2.5s), Interacting (200ms), Visual Stability (0.1)
    webVitalsAttribution: ['LCP', 'INP', 'CLS'],
  },
  images: {
  },
}

export default nextConfig
