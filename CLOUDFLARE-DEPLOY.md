# CSIR BDG Platform — Cloudflare Free Deployment

This build uses:

- Cloudflare Workers for the Next.js application
- Cloudflare D1 for the portal database
- Workers KV for uploaded and FICCI documents
- the existing local SQLite database and folders only during local development

The source FICCI ZIP is intentionally excluded. Its extracted 229 documents are uploaded individually.

## Free-tier fit checked

- Current database: about 2.7 MB
- Current FICCI documents: about 270 MB
- Largest FICCI document: under 25 MiB
- KV deployment set: under the 1 GB free storage limit
- D1 deployment set: under the 500 MB per-database free limit
- Final Worker dry run: 2,697.73 KiB gzip, below the 3 MB Workers Free limit
- Final D1 snapshot verified: 1,961 technologies, 12 users and 229 documents
- D1 login, authenticated dashboard and PBKDF2 registration were smoke-tested successfully

## One-time deployment

Open PowerShell in the project folder.

### 1. Install and prepare the snapshot

```powershell
npm.cmd install
npm.cmd run cf:prepare-data
```

This generates `prisma/d1/schema.sql` and the ignored one-time `prisma/d1/seed.sql`.

It also creates the ignored `prisma/d1/initial-credentials.json` file. That file contains temporary Cloudflare passwords for legacy bcrypt accounts converted to free-tier-friendly PBKDF2. Save it securely; do not email it or add it to Git. Re-running preparation reuses the same temporary passwords.

### 2. Sign in to the free Cloudflare account

```powershell
npx.cmd wrangler login
```

A browser opens. Authorize Wrangler. Do not select Workers Paid.

### 3. First deployment and automatic free resource creation

```powershell
npm.cmd run cf:deploy
```

Wrangler automatically creates the free `DB` D1 binding and `FILES` KV binding and writes their IDs into `wrangler.jsonc`.

### 4. Import the existing portal database

```powershell
npm.cmd run cf:db:remote
```

Run this only for the first deployment. The seed uses `INSERT OR IGNORE`, but the schema creation itself is one-time.

After import, open `prisma/d1/initial-credentials.json` for the temporary Admin, governing-body and NPL lab credentials, then change each active password from the portal.

### 5. Upload templates and FICCI documents

```powershell
npm.cmd run cf:files:remote
```

This uploads 229 FICCI documents plus active templates/uploads. The 245 MB duplicate source ZIP is skipped.

### 6. Add a secure session secret

Generate a secret:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [Convert]::ToBase64String($bytes)
$secret | npx.cmd wrangler secret put SESSION_SECRET
```

Optional AI enrichment requires an API key:

```powershell
npx.cmd wrangler secret put OPENAI_API_KEY
```

Paste the key only when Wrangler asks. Local rule-based analysis works without it.

### 7. Deploy once more

```powershell
npm.cmd run cf:deploy
```

Wrangler prints the permanent `https://csir-bdg-platform.<account>.workers.dev` URL. The desktop can now be switched off.

## Future code updates

```powershell
npm.cmd run cf:deploy
```

Do not rerun the initial database snapshot after people start editing production data.

## Local development remains unchanged

```powershell
npm.cmd run dev
```

Local development continues to use `prisma/dev.db`, `storage/`, and `FICCI/`.

## Free-tier operational limits

The free plan is suitable for demonstration and light internal testing. Workers Free currently allows 100,000 requests/day, a 3 MB compressed Worker and 10 ms CPU per invocation; the app uses native WebCrypto password hashing to avoid bcrypt CPU pressure. Large Excel/AI analysis can hit Workers CPU or memory limits. KV is eventually consistent, so a newly uploaded replacement may take a short time to appear in every region. For production CSIR use, obtain an approved institutional hosting and security review.

Official limits: https://developers.cloudflare.com/workers/platform/limits/
Official pricing: https://developers.cloudflare.com/workers/platform/pricing/
