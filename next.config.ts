import type { NextConfig } from 'next'
import { ROUTES } from '@/lib/helpers/routes';

const nextConfig: NextConfig = {
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
