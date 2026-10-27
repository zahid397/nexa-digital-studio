import type { Metadata } from 'next'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/dm-sans'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { getSite } from '@/lib/cms'
import { SpeedInsights } from '@vercel/speed-insights/next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Nexa Digital Studio', template: '%s | Nexa Digital Studio' },
  description:
    'A fictional digital studio demonstrating thoughtful design, Next.js development and a real Payload content management system.',
  openGraph: {
    type: 'website',
    siteName: 'Nexa Digital Studio',
    locale: 'en_GB',
    images: [{ url: '/images/og.png', width: 1200, height: 630, alt: 'Nexa Digital Studio' }],
  },
  robots: { index: true, follow: true },
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  const site = await getSite()
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation brand={site.brandName} links={site.navigation ?? []} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer site={site} />
        <SpeedInsights />
      </body>
    </html>
  )
}
