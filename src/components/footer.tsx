import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SiteSetting } from '@/payload-types'
import { Wordmark } from './navigation'
export function Footer({ site }: { site: SiteSetting }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <p className="eyebrow">
            <span />
            The next chapter
          </p>
          <Link href="/contact" className="footer-invitation">
            <h2>{site.footerHeading}</h2>
            <span className="footer-arrow">
              <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        </div>
        <div className="footer-middle">
          <div>
            <Link href="/" aria-label={`${site.brandName} home`}>
              <Wordmark />
            </Link>
            <p>{site.tagline}</p>
          </div>
          <nav aria-label="Footer navigation">
            {site.footerLinks?.map((l) => (
              <Link href={l.href} key={l.id ?? l.href}>
                {l.label}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="footer-location">
            <p>{site.location}</p>
            <p className="micro">
              {site.email}
              <br />
              <span className="muted">Illustrative contact address</span>
            </p>
            <Link href="/contact" className="underlined">
              Use the inquiry form
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {site.brandName}
          </p>
          <p>{site.footerNote}</p>
          <Link href="/admin">
            Studio CMS
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
