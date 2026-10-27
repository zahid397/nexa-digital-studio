# Nexa Digital Studio

Source repository: [zahid397/nexa-digital-studio](https://github.com/zahid397/nexa-digital-studio).

Live website: https://nexa-digital-studio-neon.vercel.app. Production demo content is initialized. First-administrator creation is a private owner action: see [OWNER_SETUP.md](OWNER_SETUP.md).

A working digital-agency recruitment demonstration with a real Payload CMS administration panel and PostgreSQL persistence. The agency, team profiles, testimonials and portfolio brands are fictional and explicitly labelled. The website does not claim real client relationships or business results.

## Stack

Next.js 16.4.3 App Router, React 19.3.1, strict TypeScript, Payload 3.92.0, the official Payload PostgreSQL adapter, Neon, Tailwind CSS 4, Motion, Lucide, Zod and Playwright. Payload and its integration packages use the same exact version. The lockfile records all installed versions.

Compatibility was checked against Payload's installation documentation and the actual `@payloadcms/next` package peer dependencies. This version requires Node.js 24.22.1 or newer in the 24.x line. It uses `withPayload` and Payload's real Next.js admin/API routes. No CMS dashboard, database persistence or form success is simulated.

## Local setup

1. Install Node.js 24.22.1 or newer in the 24.x line.
2. Run `npm ci`.
3. For an independent local database, copy `.env.example` to `.env`, set its Neon pooled runtime URL and direct migration URL, and generate a unique local `PAYLOAD_SECRET`, for example with `openssl rand -hex 40`. Keep these values private. When operating the existing production database, use its actual existing private environment and preserve the deployed `PAYLOAD_SECRET`; follow [OWNER_SETUP.md](OWNER_SETUP.md).
4. Set `SITE_URL=http://localhost:3000` locally.
5. Apply the committed migrations only to that intended local database:

```bash
PAYLOAD_MIGRATING=true npm run migrate
```

6. Create your administrator with the temporary, silently prompted owner environment in [OWNER_SETUP.md](OWNER_SETUP.md). The script requires `INITIAL_ADMIN_EMAIL` and a unique password of at least 16 non-padding characters. It refuses to replace existing users. Never add these credentials to Vercel or commit them.
7. Initialize missing fictional demo content and start the local application:

```bash
SEED_DEMO=true npm run seed
npm run dev
```

Public registration, including the first-user API endpoint, remains disabled. An empty CMS shows secure owner setup instructions instead of an unusable public registration form. The seeder inserts missing examples and fills missing global fields while preserving existing edited records, arrays and drafts; it reports anything requiring editorial review instead of silently publishing it. `SEED_DEMO=true` applies only to the explicit seed command and must not be left in Vercel Production.

Open `http://localhost:3000`, and log in at `http://localhost:3000/admin`.

The existing recruitment deployment is https://nexa-digital-studio-neon.vercel.app; its intended owner sign-in URL is `/admin/login`. Current production setup and verification results are recorded in [QA.md](QA.md). A successful build does not establish that a production administrator has been created.

## Real content management

| Area                        | CMS model                  | Behaviour                                                                                                    |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Home                        | Homepage global            | Edit hero, featured-section headings, advantages and illustrative testimonial; publish changes               |
| About                       | About the studio global    | Edit mission, vision, values, workflow and illustrative team profiles                                        |
| Navigation, contact, footer | Site settings global       | Edit brand details, internal navigation, inquiry introduction, privacy note and footer                       |
| Services                    | Services collection        | Create, edit, delete, order, draft and publish services; edit rich text and deliverables                     |
| Portfolio                   | Projects collection        | Create, edit, delete, draft and publish case studies; set categories, mockups, galleries and technology tags |
| Categories                  | Categories collection      | Maintain portfolio filters                                                                                   |
| Inquiries                   | Private inquiry collection | Review saved contact messages and mark them new, reviewing or closed                                         |
| Administrators              | Users collection           | Authenticated administrator-only account management                                                          |

Public pages query Payload with access control enabled and only published content. They render dynamically, so a refresh shows published edits without rebuilding. Requests within a render share queries through React's request-scoped cache. Anonymous requests cannot list inquiries, manage users, edit content, read versions or request drafts.

The six bundled project mockups are original SVG interface/product illustrations. Editors choose these assets and their alternative text in the CMS. This version deliberately does not accept arbitrary file uploads or remote image URLs. Adding new image files requires adding a reviewed asset and updating the asset choices through a code deployment. There is no temporary-disk upload feature that would lose files on Vercel.

## Routes

`/`, `/about`, `/services`, `/services/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/contact`, `/admin`, `/api/contact`, Payload's `/api/*`, `/robots.txt` and `/sitemap.xml`.

Portfolio filtering happens in the browser using published CMS records. Project and service detail pages fetch their matching published documents. Unpublished or missing documents return a not-found page. Loading and error states are included.

## Contact behaviour and security

The form posts to a real server route. Zod validates text fields, a streamed byte count limits requests to 24 KB, and the server verifies the selected service is published. A honeypot rejects basic automated submissions. A PostgreSQL atomic counter limits new inquiries to five per hour for each trusted Vercel client IP. Only an HMAC of the IP and time bucket is stored, and expired counter rows are removed. Local development intentionally shares a single limiter key. Shared university/office networks may therefore share a limit in deployment.

A client-generated reference and database uniqueness make identical retries safe. Reusing a reference for changed data returns a conflict. The UI only reports success after a committed inquiry exists. Submissions are stored in the private CMS inbox. **No email delivery service is configured and no email is claimed to have been sent.** Password recovery by email is also disabled. The administrator can change a password while logged in, or the owner can use the guarded recovery script.

Origin checks restrict contact submissions to `SITE_URL`. Payload handles authenticated admin sessions, HttpOnly cookies, CSRF checking and login lockout. HTTPS deployments use secure cookies. Access is enforced server-side. Text renders through React escaping; user input is never inserted using `dangerouslySetInnerHTML`. Public navigation values accept safe internal paths only. No API keys or passwords use `NEXT_PUBLIC_*` variables.

## Schema and migrations

`src/cms/` defines the schema as code. `src/payload-types.ts` contains generated TypeScript models. `src/migrations/` contains the generated relational schema, snapshot and an additional rate-limit migration. It includes users and sessions, services and their versions, projects and galleries/tags/versions, categories, inquiries, globals, relationships, indexes and Payload metadata tables.

Migration execution is explicit. The application has `push:false`, so development does not silently change production schema. Use a direct Neon connection and run migrations before releasing code. Do not run `migrate:fresh`, reset or down commands against the live database.

After schema changes:

```bash
npm run generate:types
npm run generate:importmap
npm run migrate:create
```

Inspect generated migrations, test them on an isolated database, then apply reviewed migrations. The contact-rate table is intentionally managed by its committed migration.

## Checks and isolated testing

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

Copy `.env.test.example` to `.env.test`. Use a separate Neon branch with a different endpoint, independent secret and test administrator. Keep `NEXA_TEST_DATABASE=true`. The test guard refuses the production endpoint and only allows the local test website.

```bash
node scripts/with-env.mjs .env.test npm run migrate
node --env-file=.env.test --import tsx scripts/create-admin.ts
node --env-file=.env.test --import tsx scripts/seed.ts
npm run test:integration
node scripts/with-env.mjs .env.test npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts the production server itself on port 3000 using `.env.test`. Do not run a second server on that port during the tests. Run the integration and browser suites sequentially because both exercise the same isolated content. Browser tests exercise navigation, filters, mobile menu, responsive widths, real admin login, creating and publishing a project, public refresh, editing Home and About content, draft privacy, contact persistence, server authorization and basic spam limits. Test data is clearly prefixed. Browser traces are disabled to avoid recording authentication requests or passwords. Screenshots contain public demo pages only.

The optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can point to an available Chromium binary in a restricted CI environment. `NEXA_NEON_WEBSOCKET=true` is an opt-in development workaround for environments without PostgreSQL TCP access. It uses Neon's real pg-compatible WebSocket driver and the environment's HTTPS proxy, while retaining transactions. Standard Vercel deployment uses the normal PostgreSQL driver and does not require that option.

See `QA.md` for actual executed results, not assumed results. See `DEPLOYMENT.md` for Vercel deployment, `DEMO_CHECKLIST.md` for the recording plan and `SUBMISSION_EMAIL.md` for the recruitment draft.

## Owner password recovery

Set the existing administrator email and a new strong password in a private local environment. Run `CONFIRM_ADMIN_RECOVERY=true npm run admin:recover`. This requires database credentials and is never a public website action. Remove the password from the environment afterwards.

## Limitations

No live commercial projects, email delivery, third-party analytics, payment provider or unconfigured upload storage are represented as working integrations. The contact form is intended for a recruitment demonstration and should not collect sensitive information. Database and hosting quotas still apply on free plans. A screenshot or browser test confirms the checked environment and does not guarantee every browser/device combination.

## Official references

- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/database/postgres
- https://payloadcms.com/docs/production/deployment
- https://neon.com/docs/connect/connection-pooling
- https://vercel.com/docs/frameworks/full-stack/nextjs

Created with AI-assisted engineering. Validation results and remaining deployment access requirements are documented honestly in `QA.md`.
