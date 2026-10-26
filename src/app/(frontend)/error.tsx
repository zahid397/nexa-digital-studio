'use client'
import { ButtonLink } from '@/components/ui'
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container empty-state">
      <p className="eyebrow">A brief interruption</p>
      <h1>We couldn’t load this page.</h1>
      <p>Please try again. Your browser has not submitted any form data.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
      <ButtonLink href="/" variant="text">
        Back to home
      </ButtonLink>
    </section>
  )
}
