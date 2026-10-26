# Vercel deployment

The source is a full Next.js application with Payload running in the same deployment. It is not a static export. A separate paid application server is unnecessary.

## Required resources

- A GitHub repository containing this project, excluding `.env*` secrets and the `private/` directory.
- A Neon PostgreSQL production database. Keep an isolated branch for automated tests.
- A Vercel project using Next.js and Node.js 24.x, with a version meeting Payload's Node requirement.

## Environment

Set only these deployment secrets/settings:

| Variable                | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Pooled Neon runtime connection string                                            |
| `DATABASE_URL_UNPOOLED` | Direct migration connection, if migrations run in a controlled owner environment |
| `PAYLOAD_SECRET`        | Independent long random secret for the production CMS                            |
| `SITE_URL`              | Exact HTTPS production origin, with no trailing slash                            |

Do not deploy `INITIAL_ADMIN_PASSWORD`, `INITIAL_ADMIN_EMAIL`, `SEED_DEMO`, `.env.test`, private administrator instructions or test database credentials. Use the owner CLI to create the first administrator and seed the database before opening the site. Keep preview deployment variables on a separate preview database if you enable previews. The canonical `SITE_URL` origin check intentionally prevents inquiry submissions from unrelated preview domains.

## Release sequence

1. Verify the intended Vercel account/team and the new `nexa-digital-studio-zahid` project. Do not overwrite unrelated projects.
2. Push the reviewed source to a new GitHub repository and import it into Vercel, or deploy the reviewed files through the Vercel API.
3. Use `npm ci` for installation and `npm run build` for the build. The project includes `vercel.json` with the Singapore function region near the selected Neon region.
4. Apply committed migrations to the production database using the direct URL. Never run isolated tests against it.
5. Create the initial administrator with the secure CLI script. Seed the fictional demo content if appropriate. Keep the generated credentials private.
6. Set the exact production URL as `SITE_URL` and deploy. Built code and environment settings must use the same intended database.
7. Wait for a `READY` result. Open all five public pages, one case study, a service page and `/admin/login`. Check mobile navigation and rendered assets.
8. Confirm an anonymous request to `/api/inquiries` and `/api/users` is denied. For the live site, use non-destructive checks. Demonstrate actual editing and test inquiries on the isolated branch or in a consented recording.

The Vercel connector may require team access approval through its own consent link. A deployment cannot proceed until that team grant is approved. A source ZIP or local build is not a live deployment and must not be described as one.

## Free-tier considerations

Payload is self-hosted open-source software. The application adds no paid APIs. Neon and Vercel account quotas, acceptable-use rules, build quotas and current plan terms still apply. No paid upgrades should be enabled automatically. Free resources are not an unlimited hosting guarantee.

No server filesystem upload storage is used. The included mockups are shipped assets, and content/editorial data stays in PostgreSQL. Back up database data separately from the Git repository. Deleting the database removes content and inquiries even when source files remain.
