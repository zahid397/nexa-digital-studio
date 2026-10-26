import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getServices } from '@/lib/cms'
import { EmptyState, PageHeading, ServiceIcon } from '@/components/ui'
import { Reveal } from '@/components/motion'
export const metadata: Metadata = {
  title: 'Services',
  description:
    'Web development, CMS architecture, UI/UX, branding, marketing and e-commerce capabilities.',
  alternates: { canonical: '/services' },
}
export default async function ServicesPage() {
  const { docs } = await getServices()
  return (
    <div className="container">
      <PageHeading
        eyebrow="Our capabilities"
        title="The whole picture. The fine details."
        description="A thoughtful mix of strategy, design and engineering. Choose a starting point, and we’ll work out the right shape together."
      />
      {docs.length ? (
        <section className="services-grid section">
          {docs.map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 0.07}>
              <article className="service-card">
                <div className="service-card-top">
                  <ServiceIcon name={s.icon} size={35} />
                  <span className="micro muted">0{i + 1}</span>
                </div>
                <h2>{s.title}</h2>
                <p>{s.description}</p>
                <ul>
                  {s.deliverables?.slice(0, 3).map((d) => (
                    <li key={d.id ?? d.item}>{d.item}</li>
                  ))}
                </ul>
                <Link href={`/services/${s.slug}`} className="service-card-link">
                  Explore service <ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              </article>
            </Reveal>
          ))}
        </section>
      ) : (
        <EmptyState
          title="A new capability is on its way."
          description="The studio is updating its services. Tell us about the work you have in mind."
        />
      )}
    </div>
  )
}
