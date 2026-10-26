# Nexa recovery checkpoint

The existing architecture and premium dark identity are preserved. Source branch: codex/nexa-cms-completion. See QA.md for executed checks and the recovery PR/final handover for the exact released commit/deployment.

Completed: mobile native-modal navigation/focus/scroll/background protection; five required links even before seed; explicit contact service recovery and truthful success; secure owner setup view; guarded idempotent seed/global repair and bootstrap locks; owner setup documentation; all 6 service/all 6 project detail coverage. No schema changes or public administrator registration were introduced.

Verification: npm ci/typecheck/lint/build passed; 13 focused tests, 4 real CMS/PostgreSQL integration tests and 19 browser scenarios passed. All five widths 360/390/768/1024/1440 tested. Full npm audit 0. Test fixtures were fixed without suppressing assertions or security rules.

Production: existing Neon project billowing-base-44726174, production branch br-divine-snow-aouwsqul, database nexa. Both original migrations preserved. Authorized CLI seed completed with 6 published services, 6 published fictional projects, categories and all 3 globals. Existing Vercel project prj_q7H9E37UT79szzt9R2jBZPU8qIj1 and production domain https://nexa-digital-studio-neon.vercel.app are the only release targets. SITE_URL set to that exact origin; no seed switch/bootstrap credentials in Vercel.

Remaining owner action: create the first production administrator through OWNER_SETUP.md using private chosen credentials, then sign in normally. No production admin account/password was invented, printed or committed. Authentication/editing/inquiry persistence were verified on the isolated QA branch; do not equate that with a tested production admin session.

Release: push this reviewed branch, deploy its exact head to the existing production project, monitor READY, run public non-destructive browser/API checks and update the PR/final delivery evidence. Do not recreate databases/projects. No email provider exists. Private env/test files and raw authentication artifacts stay ignored and must not be copied into source archives.

Release tracking: [recovery PR #2](https://github.com/zahid397/nexa-digital-studio/pull/2) records the current exact source SHA, deployment ID and terminal/live checks. Initial release c06e50d reached READY as dpl_6UFAvYp8JChi1TsBNsVSYEmJyKpE. Post-release SSL warnings led to a minimal explicit verify-full URL normalizer; 13 focused, 4 database and all 19 browser tests plus build/lint/typecheck/audit passed again. No credential, hostname or unrelated TLS flags are rewritten. The PR contains the follow-up release result; inspect it before repeating work.

An automatic preview build lacks its separate preview PAYLOAD_SECRET; it is not evidence that the production deployment failed. No dummy secret or production-credential copying was used to mask this. Production admin creation remains the private owner action described above.
