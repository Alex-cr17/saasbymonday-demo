import { ROUTES } from '@/lib/helpers/routes';

export const siteConfig = {
  name: 'SaaS Template',
  url: 'https://example.com',
  description: 'Multi-tenant SaaS boilerplate',
  baseLinks: {
    dashboard: ROUTES.APP.DASHBOARD,
  },
}

export type siteConfig = typeof siteConfig
