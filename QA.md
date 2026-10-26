# Verification results

Date: 26 October 2026. Results below describe checks that actually ran.

| Check | Result |
| --- | --- |
| Dependency installation and clean `npm ci` | Passed |
| Strict TypeScript | Passed |
| ESLint | Passed |
| Next.js production build | Passed |
| PostgreSQL migrations | Executed successfully; repeat application was a no-op |
| Real database/CMS integration suite | 4 passed, 0 failed |
| Complete Playwright browser suite | 10 passed, 0 failed, 0 skipped |
| Production dependency audit | 0 vulnerabilities reported |
| Vercel live deployment | Blocked by missing team access grant |
| Production administrator and seed | Blocked by automatic approval review |
| GitHub repository publication | Not completed; no repository URL is claimed |

## Browser coverage

The full suite used a local production build and the real isolated Neon database. It checked navigation across all five pages, portfolio filters and case-study routes, mobile menu keyboard dismissal, public layouts at 360/768/1440 pixels, real admin login, creating a draft through the Payload UI, publishing it and seeing it publicly after refresh, editing homepage content and seeing public changes, contact validation and a persisted inquiry visible in the CMS, anonymous access denial including versions/drafts/first-user registration, idempotency conflicts, spam/rate limits, reduced motion and public screenshots. The final complete run passed all 10 tests in approximately 102 seconds.

The publishing test waits for the draft save to finish navigating to the persisted document before clicking Publish changes. This avoids sending a second create request before the editor transition completes. Partial-update slug validation also preserves an existing slug when a publish operation omits that field.

## Integration coverage

Four database integration tests check server-side contact validation, unauthorized inquiry/account access, draft/publish/unpublish persistence, and homepage publication with unauthorized global edits denied. Tests use independent credentials and a dedicated Neon branch. The test guard refuses the production endpoint. Shared-content tests run sequentially. No destructive tests were run against production.

## Visual review and limits

Public desktop and mobile screenshots were reviewed for layout and readable content. Reduced-motion styles display content immediately, without retaining hidden off-screen reveals. Screenshots contain fictional public content only. Browser checks used Chromium 153 in a restricted environment with an available headless executable. Physical Android/Samsung Internet, Safari and a comprehensive screen-reader audit were not performed. No Lighthouse score or performance benchmark is claimed.

The optional WebSocket database driver was used for the restricted development workspace, with real PostgreSQL transactions and persistence. Standard Vercel deployment uses the regular PostgreSQL adapter. See SECURITY.md for the dependency patches and operational boundaries. An audit result is time-specific and does not guarantee the absence of every possible issue.

## Deployment status

The new production database has its initial schema but no administrator or seeded demo content. This state was checked read-only. Automatic approval review rejected the command to create its initial administrator and seed content as an unapproved persistent production change. It has not been retried through another route. Vercel separately returned a team-access authorization error. No production URL or live CMS login URL is claimed.

The application source, tested migrations, safe content seed, environment examples, setup/deployment guides, public screenshots, recording checklist and recruitment email draft are included. Private environment files, passwords, installed dependencies, raw authentication logs and browser traces are excluded.
