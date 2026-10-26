import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getService } from '@/lib/cms'
import { ButtonLink, PageHeading, ServiceIcon } from '@/components/ui'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await getService(slug)
  return {
    title: s?.seo?.title ?? s?.title ?? 'Service',
    description: s?.seo?.description ?? s?.description,
    alternates: { canonical: `/services/${slug}` },
  }
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const s = await getService(slug)
  if (!s) notFound()
  return (
    <div className="container">
      <Link href="/services" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        All services
      </Link>
      <PageHeading eyebrow="Studio capability" title={s.title} description={s.intro} />
      <section className="service-detail section">
        <div className="service-detail-main">
          <div className="detail-icon">
            <ServiceIcon name={s.icon} size={60} />
          </div>
          <h2>A considered foundation.</h2>
          {s.content && <RichText data={s.content} className="rich-text" />}
          <ButtonLink href={`/contact?service=${encodeURIComponent(s.slug)}`}>
            {s.ctaLabel}
          </ButtonLink>
        </div>
        <aside className="deliverables">
          <p className="eyebrow">What we can deliver</p>
          <ul>
            {s.deliverables?.map((d) => (
              <li key={d.id ?? d.item}>
                <Check size={18} aria-hidden="true" />
                {d.item}
              </li>
            ))}
          </ul>
          <p className="micro muted">
            Final scope depends on your project. This website is a recruitment demonstration.
          </p>
        </aside>
      </section>
    </div>
  )
}
