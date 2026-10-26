import Link from 'next/link'
import './cms-owner-setup.css'

/**
 * Replaces Payload's public first-user form, not its authentication or setup API.
 * Payload only shows this built-in view while the users collection is empty.
 * The owner still creates the first account through the guarded CLI script.
 */
export function OwnerSetupView() {
  return (
    <div className="nexa-owner-setup">
      <p className="nexa-owner-setup__eyebrow">Nexa Studio CMS</p>
      <div className="nexa-owner-setup__mark" aria-hidden="true">✳</div>
      <h1>Secure owner setup required</h1>
      <p>
        Public administrator registration is disabled. The site owner must create the first
        account from a trusted private environment before the CMS can accept a sign-in.
      </p>
      <section aria-labelledby="owner-setup-steps" className="nexa-owner-setup__steps">
        <h2 id="owner-setup-steps">For the site owner</h2>
        <ol>
          <li>Open the existing project checkout and load its private database environment.</li>
          <li>Set your administrator email and a unique password using the owner setup guide.</li>
          <li>
            Run <code>npm run admin:create</code>, then remove the bootstrap credentials from
            the environment.
          </li>
        </ol>
        <p>This website does not collect setup passwords or provide a public setup endpoint.</p>
      </section>
      <div className="nexa-owner-setup__actions">
        <a href="https://github.com/zahid397/nexa-digital-studio#local-setup">
          Owner setup guide <span aria-hidden="true">↗</span>
        </a>
        <Link href="/">Return to the website</Link>
      </div>
      <p className="nexa-owner-setup__sign-in">
        Once the owner completes setup, <Link href="/admin/login">sign in to the CMS</Link>.
      </p>
    </div>
  )
}
