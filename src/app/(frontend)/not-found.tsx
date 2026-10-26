import { ButtonLink } from '@/components/ui'
export default function NotFound() {
  return (
    <section className="container empty-state">
      <p className="eyebrow">404 / A slight detour</p>
      <h1>This page has moved off the canvas.</h1>
      <p>The project may be unpublished, or the link may have changed.</p>
      <ButtonLink href="/portfolio">Explore the work</ButtonLink>
      <ButtonLink href="/" variant="text">
        Back to home
      </ButtonLink>
    </section>
  )
}
