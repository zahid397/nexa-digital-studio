import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getProject } from '@/lib/cms'
import { ButtonLink } from '@/components/ui'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProject(slug)
  return {
    title: p?.seo?.title ?? p?.title ?? 'Project',
    description: p?.seo?.description ?? p?.summary,
    alternates: { canonical: `/portfolio/${slug}` },
  }
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const p = await getProject(slug)
  if (!p) notFound()
  const category = typeof p.category === 'object' ? p.category.title : 'Project'
  return (
    <div className="container">
      <Link href="/portfolio" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Selected work
      </Link>
      <header className="project-heading">
        <div>
          <p className="eyebrow">
            <span />
            {category}
            {p.isDemo && <span className="pill">Demo concept</span>}
          </p>
          <h1>{p.title}</h1>
          <p>{p.summary}</p>
        </div>
        <div className="project-meta">
          <p>{p.year}</p>
          <div className="technology-tags">
            {p.technologies?.map((t) => (
              <span key={t.id ?? t.name}>{t.name}</span>
            ))}
          </div>
        </div>
      </header>
      <div className="project-cover">
        <Image src={p.image} alt={p.imageAlt} width={1200} height={900} priority unoptimized />
      </div>
      <section className="case-study section">
        <div>
          <p className="eyebrow">
            <span />
            Project overview
          </p>
          <h2>The thinking behind the experience.</h2>
          {p.isDemo && (
            <p className="micro muted">
              Self-initiated fictional work. No real client relationship or verified commercial
              results.
            </p>
          )}
        </div>
        <div>
          <h3>Overview</h3>
          <p>{p.overview}</p>
          <h3>The challenge</h3>
          <p>{p.challenge}</p>
          <h3>The solution</h3>
          <p>{p.solution}</p>
          {p.body && <RichText data={p.body} className="rich-text" />}
        </div>
      </section>
      {!!p.gallery?.length && (
        <section className="project-gallery" aria-label="Project image gallery">
          {p.gallery.map((g, i) => (
            <figure key={g.id ?? i}>
              <Image src={g.image} alt={g.imageAlt} width={1200} height={900} unoptimized />
              <figcaption>{g.imageAlt}</figcaption>
            </figure>
          ))}
        </section>
      )}
      <div className="case-study-cta">
        <h2>A different idea in mind?</h2>
        <ButtonLink href="/contact">Let’s explore it</ButtonLink>
      </div>
    </div>
  )
}
