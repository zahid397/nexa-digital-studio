'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
type NavItem = { label: string; href: string }
export function Wordmark() {
  return (
    <span className="wordmark">
      nexa<span className="brand-dot">✳</span>
    </span>
  )
}
export function Navigation({ links, brand }: { links: NavItem[]; brand: string }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const media = window.matchMedia('(min-width: 900px)')
    const closeOnDesktop = () => {
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', closeOnDesktop)
    return () => {
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', closeOnDesktop)
    }
  }, [open])
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" aria-label={`${brand} home`} className="brand">
          <Wordmark />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="nav-cta">
          Let’s talk <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <button
          ref={trigger}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
        {open && (
          <nav ref={panel} id="mobile-menu" aria-label="Mobile navigation" className="mobile-nav">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={path === l.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="muted">0{i + 1}</span>
                {l.label}
                <ArrowUpRight size={22} aria-hidden="true" />
              </Link>
            ))}
            <p className="micro muted">Independent thinking. Thoughtful digital.</p>
          </nav>
        )}
      </div>
    </header>
  )
}
