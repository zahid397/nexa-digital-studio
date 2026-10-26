# Vercel deployment

The source is a full Next.js application with Payload running in the same deployment. It is not a static export. A separate paid application server is unnecessary.

## Existing deployment target

Use the existing resources; do not create another repository, Vercel project or production database.

| Resource | Existing target |
| --- | --- |
| GitHub | `zahid397/nexa-digital-studio`, production branch `main` |
| Vercel project | `nexa-digital-studio`, ID `prj_q7H9E37UT79szzt9R2jBZPU8qIj1` |
| Vercel team | `team_w57oFITOa0Iic95qhJT4uo0V` |
| Production origin | `https://nexa-digital-studio-neon.vercel.app` |
| Neon project | `billowing-base-44726174` |
| Neon production branch | `production`, ID `br-divine-snow-aouwsqul` |
| Database | `nexa` |
| Isolated test branch | `qa-isolated`, ID `br-lively-block-aonfzezz`; never use its credentials for production |

The app uses Node.js 24.x with a version meeting its `>=24.22.1 <25` requirement. The repository excludes `.env*` secrets, installed dependencies, test traces and the `private/` directory.

## Environment

Set only these deployment secrets/settings:

| Variable                | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Pooled Neon runtime connection string                                            |
| `DATABASE_URL_UNPOOLED` | Direct migration connection, if migrations run in a controlled owner environment |
| `PAYLOAD_SECRET`        | Existing private production CMS secret; preserve it during this recovery          |
| `SITE_URL`              | Exact HTTPS production origin, with no trailing slash                            |

Do not deploy `INITIAL_ADMIN_PASSWORD`, `INITIAL_ADMIN_EMAIL`, `SEED_DEMO`, `.env.test` or test database credentials. Use the protected owner CLI for initial administrator creation and the explicitly authorized demo seed. See [OWNER_SETUP.md](OWNER_SETUP.md) for silently prompted commands that do not print or persist a password. Public administrator registration stays disabled.

Keep preview deployment variables on a separate preview database. The canonical `SITE_URL` origin check intentionally prevents inquiry submissions from unrelated preview domains. Never change a preview to use production credentials just to make a test pass.

## Current recovery boundary

Read-only inspection on 26 October 2026 confirmed that production already contains both committed migrations, `20261026_074253` and `20261026_080000_contact_limits`. This recovery requires no schema change or database reset. The initial inspection found zero administrators, services, projects and inquiries. The explicitly authorized guarded owner CLI seed then completed successfully: six services and six fictional projects are published, with categories and all three globals initialized. Consult [QA.md](QA.md) and the recovery PR/final delivery report for the exact tested release commit, deployment ID and live checks. No production administrator password has been supplied to this session; the owner must complete the guarded setup commands rather than enabling public registration.

## Release sequence

1. Verify the Vercel team, existing project ID, source commit and intended environment in the table above. Preserve the existing domain and production database connection.
2. Run `npm ci`, typecheck, lint, build, integration and browser checks against the isolated test branch. Review the diff, commit it and push to the existing repository on the reviewed release branch. Do not force-push or overwrite unrelated changes.
3. Use `npm ci` for installation and `npm run build` for Vercel's build. The project includes `vercel.json` with Singapore functions near the existing Neon region.
4. Confirm the production migration history. Both committed migrations are already present, so do not reset or reinitialize the schema. Any future schema migration requires a reviewed migration, backup and successful isolated-branch rehearsal before application through the direct URL.
5. Run the explicitly authorized non-destructive seed with `SEED_DEMO=true` only in the private owner CLI environment. Verify six published demo services and six published demo projects. Preserve edited/draft records that require owner review. Create the initial administrator through [OWNER_SETUP.md](OWNER_SETUP.md) when the owner has supplied private credentials.
6. Preserve the actual production `PAYLOAD_SECRET`; set `SITE_URL` to the exact origin above. Do not leave bootstrap credentials or seed switches in Vercel Production. Deploy the tested commit to the existing project.
7. Wait for terminal `READY`, inspect build/runtime errors and record the deployment ID and commit. Verify all five pages, project/service details, images, category filtering, contact service options and navigation at 360, 390, 768, 1024 and 1440 pixels.
8. Verify anonymous `/api/inquiries`, `/api/users`, drafts and first-user registration remain denied. Production checks must be non-destructive. Demonstrate real login, publishing, public refresh and inquiry persistence on the isolated branch; verify production administrator sign-in only after the owner completes setup. No email delivery is configured or claimed.

The Vercel connector may require team access approval through its own consent link. A deployment cannot proceed until that team grant is approved. A source ZIP or local build is not a live deployment and must not be described as one.

## Free-tier considerations

Payload is self-hosted open-source software. The application adds no paid APIs. Neon and Vercel account quotas, acceptable-use rules, build quotas and current plan terms still apply. No paid upgrades should be enabled automatically. Free resources are not an unlimited hosting guarantee.

No server filesystem upload storage is used. The included mockups are shipped assets, and content/editorial data stays in PostgreSQL. Back up database data separately from the Git repository. Deleting the database removes content and inquiries even when source files remain.
