# Verification and release evidence

Updated 26 October 2026. These results describe executed checks, not assumed passing tests.

| Check | Actual result |
| --- | --- |
| Clean npm ci on Node 24.22.1 | Passed; 686 locked packages installed |
| npm run typecheck | Passed |
| npm run lint | Passed without warnings in the final run |
| npm run test:unit | 13 passed |
| npm run test:integration | 4 passed against the existing isolated Neon QA branch |
| npm run build | Passed; Next.js 16.4.3 production build, no schema push |
| npm run test:e2e | 19 passed, 0 failed, 0 skipped in the final full run |
| npm audit | 0 vulnerabilities, including development dependencies |
| Existing production migrations | Both committed migrations already applied; preserved unchanged |
| Guarded production demo seed | Exit 0; 6 services and 6 fictional projects published, categories and all 3 globals initialized |
| Production administrator | Not created by this recovery; private owner bootstrap remains required |

The reviewed source is delivered on `codex/nexa-cms-completion`. The recovery pull request and final handover record the exact remote SHA, Vercel deployment ID, terminal READY status and live post-deploy checks. The production target is the existing https://nexa-digital-studio-neon.vercel.app project; no duplicate project or database was created. A local build or a prior deployment is not evidence of the new source being released.

## Browser coverage

All five public pages were checked at 360, 390, 768, 1024 and 1440 pixels without horizontal overflow. The suite exercises mobile modal navigation, native background inertness, focus trapping/restoration, Escape/close/resize/destination cleanup, strict 200px scroll restoration, CMS-driven links, all 6 service detail pages and inquiry CTAs, all 6 fictional project detail pages and images, portfolio filtering, published-service selection and recovery from an empty service list while retaining an unsent draft.

Real CMS checks use the actual Payload UI and the isolated PostgreSQL branch: administrator login, creating a draft, publishing it, public refresh, editing/publishing/restoring homepage content, a contact inquiry persisted and visible in the authenticated private inbox, unauthorized access/version/draft/first-register denials, idempotent retries/conflicts, spam limits and reduced motion. The new failure-path test deliberately simulates only error/mismatched-reference HTTP responses; it verifies that the client retains entered data and never falsely reports a saved inquiry. Successful persistence is independently tested against the real database.

The initial recovery browser run had two test-fixture failures. The error assertion also matched Next's route announcer; it now scopes to the actual form. Playwright's locator click scrolled a visible sticky menu trigger before the application handled it; the test now uses its visible screen coordinates and retains the strict original scroll-position assertion. The complete rerun passed all 19 cases. No tests or security checks were disabled.

## Seed/bootstrap safety

Focused tests cover new content publication, repeated-seed idempotence, preservation of edited records/drafts/cleared arrays, repair of missing global fields, honest incomplete-setup reporting, private owner-input validation and setup locking. The real QA seed rerun preserved 6 services, 6 projects and all existing globals. A separately authorized production CLI operation then created only the missing fictional demo content. Production inquiries and user accounts were not created by the seed; migration history was preserved.

First-user public registration remains 403. Payload's supported createFirstUser view now gives secure owner instructions instead of presenting an impossible registration form. Existing accounts retain normal login, verified on the isolated QA environment. This does not claim a production administrator exists or that a production authenticated session was tested. Follow [OWNER_SETUP.md](OWNER_SETUP.md) privately.

## Limits and artifacts

Screenshots in docs/screenshots contain only public fictional content. docs/test-results.json is a sanitized summary, not an auth trace. Browser traces remain disabled; private environments, credentials, installed dependencies and test artifacts are ignored. No destructive tests or cleanup ran against production.

No email provider is configured, and no message or password-recovery email is claimed sent. Physical Android/Safari, a complete screen-reader audit and Lighthouse benchmarking were not performed. A post-deploy node-postgres SSL-mode warning was investigated: current connections already verified certificates. The runtime now explicitly normalizes only legacy SSL-mode aliases to verify-full while preserving credentials, host, pooled/direct selection and other TLS flags. Four focused URL/security tests cover this behavior. The fresh build compiled successfully. The standard Vercel runtime uses the normal pooled PostgreSQL driver; the restricted QA/owner CLI used the existing opt-in Neon WebSocket driver with real PostgreSQL transactions.

The automatic Git preview is a separate environment: its build fails for missing preview PAYLOAD_SECRET. This is documented rather than hidden by a fallback secret or disabled check. Production deploys use the existing protected production settings. Final deployment and runtime results are recorded in the recovery PR.
