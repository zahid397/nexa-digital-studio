# Security notes

Administrator registration is private. Public account creation and the first-user HTTP endpoint are blocked. Initial setup and password recovery require owner-held database credentials and explicit CLI commands. Authentication, signed sessions, HttpOnly cookies, CSRF checks and login lockout use Payload's supported implementation.

Public content requests apply access control and publication filters. Version history and draft requests require an administrator. Inquiries are never publicly readable or creatable through the generic CMS collection API. Only the validated contact handler creates inquiries, with a bounded request stream, origin checks, a honeypot, an atomic PostgreSQL rate limit and idempotency protection.

The contact form sends no emails. Email password recovery is deliberately disabled until a real provider is configured. Plain applicant/inquiry text is rendered through framework escaping, and private values are not embedded in public components.

## Dependency review on 26 October 2026

Exact direct dependency versions are pinned in `package.json` and the lockfile. The production dependency audit was executed with `npm audit --omit=dev --json`. The final result and test status are recorded in `QA.md`.

The latest Payload release's transitive dependency tree required the following explicit security updates:

- DOMPurify 3.4.17, addressing the affected versions listed in https://github.com/advisories/GHSA-cg2g-xh64-v4q7.
- Happy DOM 21.0.4, addressing the affected versions listed in https://github.com/advisories/GHSA-834v-8h66-3h79.
- esbuild 0.25.12 for the legacy `@esbuild-kit/core-utils` migration-tool dependency. The application does not expose an esbuild development server. Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99.
- `@vercel/functions` is pinned to 3.6.1, which provides the used pool-lifecycle helper without the newer vulnerable transitive dependency chain detected during this review.

The application is revalidated with these overrides. A clean lockfile resolution is included, with no invalid dependency tree. Future updates still require a fresh audit and application tests. An audit result is a time-specific dependency check, not a guarantee that no security issue exists.

## Operational boundaries

Keep `.env`, `.env.test`, the `private/` directory, database passwords and administrator credentials out of Git and deployment uploads. Use independent production and test databases. Do not use real personal information in demonstration recordings or test data. The public site explains how submitted inquiry data is stored.

The original source ZIP excludes private configuration, raw authentication logs, traces and test screenshots that may contain credentials. Any included public-page screenshots are reviewed separately. No live deployment or production data seed is claimed unless the required account and action approvals have completed.
