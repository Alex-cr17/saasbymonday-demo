import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { siteConfig } from './siteConfig'

import './globals.css'
import { QueryClientProviderWrapper } from '@/context/QueryClientProviderWrapper';
import { AppInitializer } from '@/components/AppInitializer';
import { PropsWithChildren } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://domain.com'),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ['Dashboard'],
  creator: 'custom',
 icons: {
   icon: '/favicon.ico',
   shortcut: '/favicon.ico',
   apple: '/apple-touch-icon.png',
   other: [
     // { rel: 'icon', type: 'image/svg+xml', url: '/logo.svg' },
     { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
     { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png' },
     { rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' },
   ],
  },
//  manifest: '/site.webmanifest',
}
function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className="antialiased h-full" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <QueryClientProviderWrapper>
          <AppInitializer>
            {children}
          </AppInitializer>
        </QueryClientProviderWrapper>
      </body>
    </html>
  )
}

export default RootLayout
