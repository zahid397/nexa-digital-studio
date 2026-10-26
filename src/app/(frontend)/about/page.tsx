import type { Metadata } from 'next'
import { getAbout } from '@/lib/cms'
import { PageHeading, SectionHeading } from '@/components/ui'
import { Process } from '@/components/process'
import { Reveal } from '@/components/motion'
export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return {
    title: about.seo?.title ?? 'About the studio',
    description: about.seo?.description ?? about.intro,
    alternates: { canonical: '/about' },
  }
}
export default async function AboutPage() {
  const about = await getAbout()
  return (
    <div className="container">
      <PageHeading eyebrow="About the studio" title={about.title} description={about.intro} />
      <section className="about-manifesto section">
        <div className="manifesto-art" aria-hidden="true">
          <span>n</span>
          <span className="manifesto-orbit" />
          <p>
            MAKE IT
            <br />
            MEAN SOMETHING.
          </p>
        </div>
        <div className="manifesto-copy">
          <Reveal>
            <p className="eyebrow">
              <span />
              Our mission
            </p>
            <h2>{about.mission}</h2>
            <p className="eyebrow vision-label">
              <span />
              Our vision
            </p>
            <p className="large-body">{about.vision}</p>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <SectionHeading eyebrow="What guides us" title="The way we see things." />
        <div className="values-grid">
          {about.values.map((v, i) => (
            <Reveal key={v.id ?? v.title} delay={i * 0.06}>
              <article>
                <span className="micro muted">0{i + 1}</span>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section process-section">
        <SectionHeading eyebrow="Our methodology" title="Good work is a conversation." />
        <Process steps={about.process} />
      </section>
      <section className="section team-section">
        <SectionHeading
          eyebrow="The people, imagined"
          title="Different minds. Shared care."
          description="Illustrative profiles created for this agency demonstration. These are not actual employees."
        />
        <div className="team-grid">
          {about.team?.map((m, i) => (
            <Reveal key={m.id ?? m.name} delay={i * 0.06}>
              <article>
                <div className={`team-portrait portrait-${i % 3}`} aria-hidden="true">
                  <span>
                    {m.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <div className="portrait-loop" />
                </div>
                <span className="demo-label">Illustrative profile</span>
                <h3>{m.name}</h3>
                <p className="team-role">{m.role}</p>
                <p>{m.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
