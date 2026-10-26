import type { MetadataRoute } from 'next'
import { getProjects, getServices } from '@/lib/cms'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = process.env.SITE_URL ?? 'http://localhost:3000'
  const [p, s] = await Promise.all([getProjects(), getServices()])
  return [
    ...['', '/about', '/services', '/portfolio', '/contact'].map((path) => ({ url: root + path })),
    ...p.docs.map((d) => ({ url: `${root}/portfolio/${d.slug}`, lastModified: d.updatedAt })),
    ...s.docs.map((d) => ({ url: `${root}/services/${d.slug}`, lastModified: d.updatedAt })),
  ]
}
