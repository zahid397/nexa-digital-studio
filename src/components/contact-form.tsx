'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
type ServiceOption = { title: string; slug: string }
type FieldErrors = Record<string, string[]>
type ResponseBody = { message?: string; reference?: string; fieldErrors?: FieldErrors }
export function ContactForm({
  services,
  privacyNote,
  initialService,
}: {
  services: ServiceOption[]
  privacyNote: string
  initialService?: string
}) {
  const router = useRouter()
  const [refreshing, refreshServices] = useTransition()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState('')
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const key = useRef('')
  const summary = useRef<HTMLDivElement>(null)
  const success = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (message || Object.keys(errors).length) summary.current?.focus()
  }, [message, errors])
  useEffect(() => {
    if (reference) success.current?.focus()
  }, [reference])
  const hint = (name: string) => (errors[name] ? `${name}-error` : undefined)
  const err = (name: string) =>
    errors[name] && (
      <p className="field-error" id={`${name}-error`}>
        {errors[name][0]}
      </p>
    )
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    if (!services.length) {
      setMessage(
        'Services are temporarily unavailable. Refresh the service list before sending your inquiry.',
      )
      return
    }
    lock.current = true
    setBusy(true)
    setErrors({})
    setMessage('')
    if (!key.current) key.current = crypto.randomUUID()
    const data = new FormData(event.currentTarget)
    const input = Object.fromEntries(data.entries())
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, submissionId: key.current }),
      })
      const body: ResponseBody = await res.json()
      if (res.ok && typeof body.reference === 'string' && body.reference === key.current) {
        setReference(body.reference)
        return
      }
      setErrors(body.fieldErrors ?? {})
      setMessage(
        res.ok
          ? 'The server did not confirm a saved inquiry. Your message is still here. Please retry.'
          : (body.message ?? 'Your inquiry could not be saved. Please retry.'),
      )
      // Validation did not create an inquiry, so edits may safely use a fresh key.
      if (res.status === 422) key.current = ''
    } catch {
      setMessage(
        'Connection interrupted. Your message is still here. Please retry the same message. If you edit it, reload first to start a new inquiry.',
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  if (reference)
    return (
      <div className="contact-success" ref={success} tabIndex={-1}>
        <span className="success-icon">
          <Check aria-hidden="true" />
        </span>
        <p className="eyebrow">Safely received</p>
        <h2>Good things start here.</h2>
        <p>Your inquiry is saved in the studio’s private inbox. This demo does not send emails.</p>
        <p className="reference">
          Reference
          <br />
          <strong>{reference}</strong>
        </p>
        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setReference('')
            setMessage('')
            key.current = ''
          }}
        >
          Send another inquiry
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>
    )
  return (
    <form className="contact-form" ref={form} onSubmit={submit} noValidate aria-busy={busy}>
      {(message || Object.keys(errors).length > 0) && (
        <div className="error-summary" ref={summary} tabIndex={-1} role="alert">
          <p>{message || 'Please check the fields below.'}</p>
          {Object.entries(errors).map(([field, details]) => (
            <a href={`#${field}`} key={field}>
              {details[0]}
            </a>
          ))}
        </div>
      )}
      {!services.length && (
        <div className="error-summary" id="service-availability" role="status">
          <p>
            Services are temporarily unavailable. Please refresh the list before sending an inquiry.
          </p>
          <button
            type="button"
            className="button button-outline"
            disabled={refreshing}
            onClick={() => refreshServices(() => router.refresh())}
          >
            {refreshing ? 'Refreshing services…' : 'Refresh services'}
          </button>
        </div>
      )}
      <fieldset disabled={busy}>
        <legend className="sr-only">Project inquiry</legend>
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">
              Your name <span>*</span>
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Full name"
              aria-invalid={!!errors.name}
              aria-describedby={hint('name')}
            />
            {err('name')}
          </div>
          <div className="field">
            <label htmlFor="email">
              Email address <span>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={hint('email')}
            />
            {err('email')}
          </div>
        </div>
        <div className="field">
          <label htmlFor="service">
            What can we help with? <span>*</span>
          </label>
          <select
            id="service"
            name="service"
            defaultValue={services.some((s) => s.slug === initialService) ? initialService : ''}
            required
            disabled={!services.length}
            aria-invalid={!!errors.service}
            aria-describedby={
              [hint('service'), !services.length ? 'service-availability' : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
          >
            <option value="" disabled>
              {services.length ? 'Select a service' : 'Services temporarily unavailable'}
            </option>
            {services.map((s) => (
              <option value={s.slug} key={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
          {err('service')}
        </div>
        <div className="field">
          <label htmlFor="budget">
            Your budget <span className="muted">(optional, USD)</span>
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue=""
            aria-invalid={!!errors.budget}
            aria-describedby={hint('budget')}
          >
            <option value="">Prefer to discuss</option>
            <option value="exploring">Still exploring</option>
            <option value="under-1000">Under $1,000</option>
            <option value="1000-5000">$1,000–$5,000</option>
            <option value="5000-15000">$5,000–$15,000</option>
            <option value="15000-plus">$15,000+</option>
          </select>
          {err('budget')}
        </div>
        <div className="field">
          <label htmlFor="message">
            A little about your project <span>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            minLength={20}
            maxLength={4000}
            required
            placeholder="What are you working on, and what would you like to change?"
            aria-invalid={!!errors.message}
            aria-describedby={`message-hint${errors.message ? ' message-error' : ''}`}
          />
          <p id="message-hint" className="micro muted">
            20–4,000 characters. Required fields are marked *.
          </p>
          {err('message')}
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <p className="form-privacy">{privacyNote}</p>
        <button className="button button-primary" type="submit" disabled={!services.length}>
          {busy ? (
            <>
              Saving inquiry <LoaderCircle size={18} className="spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Send inquiry <ArrowUpRight size={19} aria-hidden="true" />
            </>
          )}
        </button>
      </fieldset>
      <p className="sr-only" role="status">
        {busy ? 'Saving your inquiry. Please wait.' : ''}
      </p>
    </form>
  )
}
