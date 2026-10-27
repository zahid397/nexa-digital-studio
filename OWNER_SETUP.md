# Secure owner setup

This guide is for the owner of the existing Nexa deployment at **https://nexa-digital-studio-neon.vercel.app**. Payload CMS provides the content editor and private inquiry inbox. Public administrator registration is intentionally disabled, including `/api/users/first-register`; do not enable it to get past the first-user screen.

## Before running a command

1. Open a trusted checkout of `zahid397/nexa-digital-studio` on your own computer or an authorized private owner environment. Use Node.js 24.22.1 or newer in the 24.x line, then run `npm ci`.
2. Load the **existing production** settings into the private, Git-ignored root `.env`: `DATABASE_URL` (the current pooled Neon connection), `DATABASE_URL_UNPOOLED` (the current direct connection), the **actual existing Vercel `PAYLOAD_SECRET`**, and `SITE_URL=https://nexa-digital-studio-neon.vercel.app`. Obtain values through your own secret manager/provider dashboard; do not paste them into a chat, issue, screenshot or commit. Preserve connection TLS parameters. Do not copy placeholder credentials from `.env.example` into production or replace the deployed secret with a newly generated local one.
3. On macOS/Linux, restrict the private file with `chmod 600 .env`. On Windows, restrict access to your own account. Keep `.env`, `.env.test` and `.vercel` files out of archives and Git.
4. Confirm that this environment targets the existing Neon `nexa` database on the `production` branch. Its committed migrations `20261026_074253` and `20261026_080000_contact_limits` were already present at the recovery inspection. No reset, fresh migration, down migration or schema push is needed for administrator creation or demo content.

The recovery did not receive an owner administrator password and does not create an account that the owner cannot access. The commands below let you choose it privately. Store it in your password manager. No password belongs in the source, Vercel environment, command arguments or public setup UI.

## Create the first administrator — Bash, Git Bash or WSL

Run this in a Bash terminal from the repository root. The password prompt is silent, and the variables live only in a temporary subshell. Do not run it in a recorded/shared terminal session.

```bash
(
  set +x
  set -e
  trap 'unset INITIAL_ADMIN_EMAIL INITIAL_ADMIN_PASSWORD' EXIT
  unset INITIAL_ADMIN_EMAIL INITIAL_ADMIN_PASSWORD
  IFS= read -r -p 'Administrator email: ' INITIAL_ADMIN_EMAIL
  IFS= read -r -s -p 'Unique administrator password (at least 16 characters): ' INITIAL_ADMIN_PASSWORD
  printf '\n'
  export INITIAL_ADMIN_EMAIL INITIAL_ADMIN_PASSWORD
  npm run admin:create
)
```

The script validates the address and password, serializes concurrent owner setup, and creates an administrator only if the users collection is empty. It does not replace an existing user or password. An existing-account error means you should sign in or use the guarded recovery process below, rather than rerunning public registration. The script prints an outcome, never the credentials.

## Create the first administrator — PowerShell

Use this alternative in PowerShell from the repository root. The secure prompt is converted only for the child process environment and removed in `finally`.

```powershell
$ownerAdminEmail = Read-Host 'Administrator email'
$ownerAdminPassword = Read-Host 'Unique administrator password (at least 16 characters)' -AsSecureString
$ownerPasswordBuffer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ownerAdminPassword)
try {
  $env:INITIAL_ADMIN_EMAIL = $ownerAdminEmail
  $env:INITIAL_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ownerPasswordBuffer)
  npm run admin:create
  if ($LASTEXITCODE -ne 0) { throw 'Administrator setup failed. Review the safe CLI error.' }
} finally {
  Remove-Item Env:INITIAL_ADMIN_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:INITIAL_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ownerPasswordBuffer)
  $ownerAdminEmail = $null
  $ownerAdminPassword = $null
}
```

After success, close the owner terminal. Visit **https://nexa-digital-studio-neon.vercel.app/admin/login** and use the credentials you chose. Once an administrator exists, Payload redirects the initial setup view into the normal CMS authentication flow. Remove any old bootstrap credentials from private environment files and ensure none are configured in Vercel Production.

## Initialize missing fictional demo content

This operation is separately and explicitly authorized for the recruitment demonstration. If the recovery has already seeded the six services and six projects, rerunning is unnecessary. To initialize missing examples from the same private owner environment:

```bash
SEED_DEMO=true npm run seed
```

PowerShell equivalent:

```powershell
try {
  $env:SEED_DEMO = 'true'
  npm run seed
  if ($LASTEXITCODE -ne 0) { throw 'Review the seed summary before continuing.' }
} finally {
  Remove-Item Env:SEED_DEMO -ErrorAction SilentlyContinue
}
```

The seed creates missing known demo slugs with published status, fills missing global fields and preserves existing editorial content, populated arrays and drafts. It prints actual published counts and any items requiring review; exit code 2 means existing editorial decisions prevent a fully published demo. Review and publish those items deliberately in the CMS. Do not delete records, reset the database or force-publish edited drafts to clear that result. The six portfolio projects and illustrative team/testimonial content are fictional examples, not real client work.

Do not add `SEED_DEMO`, `INITIAL_ADMIN_EMAIL` or `INITIAL_ADMIN_PASSWORD` to Vercel Production or leave them set after the owner command. Only the existing application environment is needed at runtime.

## Use the CMS and verify the result

- **Homepage / About the studio / Navigation, contact and footer:** edit the corresponding globals. Publish draft-enabled globals when ready, then refresh the public website.
- **Services:** edit a service, verify its slug and content, then publish. Only published services appear publicly and in the Contact service dropdown.
- **Projects and Categories:** edit case studies and filter categories, then publish. The six bundled SVG mockups are original reviewed assets; arbitrary file uploads are not configured.
- **Inbox → Inquiries:** review stored submissions and change their status while signed in. The contact endpoint saves to PostgreSQL; no email provider is configured and no email is sent.

Test new content/editing and test inquiries on the isolated QA branch first. Production smoke checks should be non-destructive. A deployment marked `READY` does not prove administrator creation or successful contact persistence; use the actual CMS sign-in and documented QA results.

## Existing administrator recovery

Use recovery only when you own the account and database. In the same private environment, use either silent prompt pattern above, but replace the administrator-creation command with:

```bash
CONFIRM_ADMIN_RECOVERY=true npm run admin:recover
```

For PowerShell, temporarily set `$env:CONFIRM_ADMIN_RECOVERY = 'true'`, run `npm run admin:recover`, and remove that variable in `finally` together with the credential variables. Recovery targets the existing supplied email and never creates a public recovery endpoint. Email-based password recovery is not configured. Keep all passwords private and remove temporary credential variables afterwards.
