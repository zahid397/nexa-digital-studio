import type { Metadata } from 'next'
import { getProjects, getCategories } from '@/lib/cms'
import { PageHeading } from '@/components/ui'
import { PortfolioGrid } from '@/components/portfolio-grid'
export const metadata: Metadata = {
  title: 'Selected work',
  description:
    'Six fictional concept studies exploring digital products, brand websites and commerce.',
  alternates: { canonical: '/portfolio' },
}
export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()])
  return (
    <div className="container">
      <PageHeading
        eyebrow="Selected work"
        title="Ideas made tangible."
        description="A collection of self-initiated concepts. Different perspectives, considered details and a clear purpose behind every pixel."
      />
      <section className="portfolio-section">
        <PortfolioGrid projects={projects.docs} categories={categories.docs} />
        <p className="portfolio-disclaimer micro muted">
          All seeded projects are fictional demo concepts. No client relationship, award or business
          result is claimed.
        </p>
      </section>
    </div>
  )
}
