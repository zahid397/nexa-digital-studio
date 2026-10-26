import { Reveal } from './motion'
export function Process({
  steps,
}: {
  steps: { title: string; description: string; id?: string | null }[]
}) {
  return (
    <div className="process-grid">
      {steps.map((s, i) => (
        <Reveal key={s.id ?? s.title} delay={i * 0.06}>
          <article className="process-step">
            <span className="process-number">0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </article>
        </Reveal>
      ))}
    </div>
  )
}
