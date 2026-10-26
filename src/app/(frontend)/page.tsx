import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowDown, ArrowUpRight, Asterisk, Quote } from 'lucide-react'
import { getAbout, getHome, getProjects, getServices } from '@/lib/cms'
import { ButtonLink, SectionHeading, ServiceIcon } from '@/components/ui'
import { Reveal } from '@/components/motion'
import { HeroArt } from '@/components/hero-art'
import { ProjectCard } from '@/components/project-card'
import { Process } from '@/components/process'
export async function generateMetadata(): Promise<Metadata> {
  const h = await getHome()
  return {
    title: { absolute: h.seo?.title ?? 'Nexa Digital Studio' },
    description: h.seo?.description ?? h.heroDescription,
    alternates: { canonical: '/' },
  }
}
export default async function HomePage() {
  const [home, services, projects, about] = await Promise.all([
    getHome(),
    getServices(),
    getProjects(),
    getAbout(),
  ])
  const featured = projects.docs.filter((p) => p.featured).slice(0, 4)
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">
              <span />
              {home.eyebrow}
            </p>
            <h1>
              {home.heroTitle}
              <br />
              <span className="gradient-text">{home.heroAccent}</span>
            </h1>
            <p className="hero-description">{home.heroDescription}</p>
            <div className="hero-actions">
              <ButtonLink href="/contact">Start a project</ButtonLink>
              <ButtonLink href="/portfolio" variant="text">
                Explore our work
              </ButtonLink>
            </div>
          </Reveal>
          <div className="hero-signoff">
            <span className="availability-dot" />
            <p>
              Built with intention.
              <br />
              <span className="muted">From Dhaka, for the digital world.</span>
            </p>
          </div>
        </div>
        <HeroArt />
        <a href="#selected-work" className="hero-scroll">
          <ArrowDown size={15} aria-hidden="true" />A closer look
        </a>
      </section>
      <div className="capabilities-strip" aria-label="Studio disciplines">
        <div className="container">
          <span>Strategy</span>
          <Asterisk aria-hidden="true" />
          <span>Design</span>
          <Asterisk aria-hidden="true" />
          <span>Development</span>
          <Asterisk aria-hidden="true" />
          <span>Content</span>
        </div>
      </div>
      <section id="selected-work" className="section container">
        <SectionHeading
          eyebrow="Selected work"
          title={home.workTitle}
          description="Self-initiated explorations in digital design. Each project is a fictional demonstration concept."
        >
          <ButtonLink href="/portfolio" variant="outline">
            All projects
          </ButtonLink>
        </SectionHeading>
        <div className="project-grid">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.08}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section services-section">
        <div className="container services-layout">
          <div className="services-intro">
            <p className="eyebrow">
              <span />
              What we do
            </p>
            <h2>{home.servicesTitle}</h2>
            <p>
              One connected approach, from the first conversation to the details that make it yours.
            </p>
            <ButtonLink href="/services" variant="text">
              Our capabilities
            </ButtonLink>
          </div>
          <div className="service-list">
            {services.docs.map((s, i) => (
              <Reveal key={s.id}>
                <Link href={`/services/${s.slug}`} className="service-row">
                  <span className="service-index">0{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                  </div>
                  <ServiceIcon name={s.icon} />
                  <ArrowUpRight className="service-row-arrow" aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="Why Nexa" title={home.advantagesTitle} />
        <div className="advantages-grid">
          {home.advantages.map((a, i) => (
            <Reveal key={a.id ?? a.title} delay={i * 0.06}>
              <article>
                <span className="advantage-symbol" aria-hidden="true">
                  {['✳', '↗', '⌘'][i % 3]}
                </span>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container process-section">
        <SectionHeading eyebrow="How we work" title="A shared direction. Every step." />
        <Process steps={about.process} />
      </section>
      <section className="testimonial-section">
        <div className="container testimonial-inner">
          <Quote size={36} strokeWidth={1.2} aria-hidden="true" />
          <p className="eyebrow">Illustrative demo testimonial</p>
          <blockquote>{home.testimonial}</blockquote>
          <p className="muted">{home.testimonialRole}</p>
          <p className="micro muted">
            Sample copy demonstrating an editable testimonial. It is not a real client endorsement.
          </p>
        </div>
      </section>
    </>
  )
}
