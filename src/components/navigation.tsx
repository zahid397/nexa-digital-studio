'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

type NavItem = { label: string; href: string }
const requiredLinks: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
]

export function Wordmark() {
  return (
    <span className="wordmark">
      nexa<span className="brand-dot">✳</span>
    </span>
  )
}

export function Navigation({ links, brand }: { links: NavItem[]; brand: string }) {
  const path = usePathname()
  // A route change also disposes an open dialog, including browser Back/Forward.
  return <NavigationContent key={path} links={links} brand={brand} path={path} />
}

function NavigationContent({ links, brand, path }: { links: NavItem[]; brand: string; path: string }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const headerBrand = useRef<HTMLAnchorElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  // Preserve editorial labels/order while keeping every required page reachable
  // before the owner has initialized the navigation global.
  const navigation = [
    ...links,
    ...requiredLinks.filter((required) => !links.some((link) => link.href === required.href)),
  ]
  const isCurrent = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`)

  useEffect(() => {
    if (!open || !dialog.current) return
    const element = dialog.current
    const triggerElement = trigger.current
    const brandElement = headerBrand.current
    const body = document.body
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0)
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = `-${scrollX}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    // Native modal dialogs occupy the top layer, outside the sticky header's
    // backdrop-filter containing block, and make all underlying content inert.
    element.showModal()
    closeButton.current?.focus({ preventScroll: true })
    const media = window.matchMedia('(min-width: 900px)')
    const closeOnDesktop = () => {
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', closeOnDesktop)
    return () => {
      media.removeEventListener('change', closeOnDesktop)
      element.close()
      Object.assign(body.style, previous)
      const previousScrollBehavior = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(scrollX, scrollY)
      document.documentElement.style.scrollBehavior = previousScrollBehavior
      const target =
        triggerElement && getComputedStyle(triggerElement).display !== 'none'
          ? triggerElement
          : brandElement
      if (target?.isConnected) target.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link ref={headerBrand} href="/" aria-label={`${brand || 'Nexa Digital Studio'} home`} className="brand">
          <Wordmark />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
            >
              {link.label}
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
          aria-haspopup="dialog"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
        {open && (
          <dialog
            ref={dialog}
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Site navigation"
            aria-modal="true"
            onCancel={(event) => {
              event.preventDefault()
              setOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  'a[href], button:not([disabled]), [tabindex="0"]',
                ),
              )
              const first = items[0]
              const last = items[items.length - 1]
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
              }
            }}
          >
            <div className="mobile-menu-header container">
              <Link href="/" aria-label={`${brand || 'Nexa Digital Studio'} home`} className="brand" onClick={() => setOpen(false)}>
                <Wordmark />
              </Link>
              <button
                ref={closeButton}
                type="button"
                className="menu-toggle"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="mobile-nav container">
              {navigation.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="mobile-nav-index">0{index + 1}</span>
                  {link.label}
                  <ArrowUpRight size={22} aria-hidden="true" />
                </Link>
              ))}
              <p className="micro muted">Independent thinking. Thoughtful digital.</p>
            </nav>
          </dialog>
        )}
      </div>
    </header>
  )
}
