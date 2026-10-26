import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Layers3,
  PenTool,
  Sparkles,
  ChartNoAxesCombined,
  ShoppingBag,
} from 'lucide-react'
import type { ReactNode } from 'react'

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'outline' | 'text'
  className?: string
}) {
  return (
    <Link href={href} className={`button button-${variant} ${className}`}>
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  )
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span />
          {eyebrow}
        </p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  )
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">
        <span />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}
export function ServiceIcon({ name, size = 28 }: { name: string; size?: number }) {
  const Icon =
    (
      {
        code: Code2,
        layers: Layers3,
        pen: PenTool,
        spark: Sparkles,
        chart: ChartNoAxesCombined,
        bag: ShoppingBag,
      } as Record<string, typeof Code2>
    )[name] ?? Code2
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />
}
export function InlineArrow() {
  return <ArrowRight size={20} aria-hidden="true" />
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <Sparkles size={32} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      <ButtonLink href="/contact">Let’s talk instead</ButtonLink>
    </div>
  )
}
