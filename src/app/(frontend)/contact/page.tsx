import type { Metadata } from 'next'
import { ArrowDownRight, Globe2, ShieldCheck } from 'lucide-react'
import { getServices, getSite } from '@/lib/cms'
import { ContactForm } from '@/components/contact-form'
export const metadata: Metadata = {
  title: 'Start a conversation',
  description: 'Share your project through the studio’s private inquiry form.',
  alternates: { canonical: '/contact' },
}
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const [site, services, query] = await Promise.all([getSite(), getServices(), searchParams])
  return (
    <section className="container contact-layout">
      <div className="contact-copy">
        <p className="eyebrow">
          <span />
          Start a conversation
        </p>
        <h1>{site.contactTitle}</h1>
        <p className="large-body">{site.contactIntro}</p>
        <ArrowDownRight
          className="contact-big-arrow"
          size={88}
          strokeWidth={1}
          aria-hidden="true"
        />
        <div className="contact-detail">
          <Globe2 size={21} aria-hidden="true" />
          <p>{site.location}</p>
        </div>
        <div className="contact-detail">
          <ShieldCheck size={21} aria-hidden="true" />
          <p>
            Saved privately. Reviewed in the CMS.
            <br />
            <span className="muted">No email delivery is configured in this demo.</span>
          </p>
        </div>
      </div>
      <ContactForm
        services={services.docs.map((s) => ({ title: s.title, slug: s.slug }))}
        privacyNote={site.privacyNote}
        initialService={query.service}
      />
    </section>
  )
}
