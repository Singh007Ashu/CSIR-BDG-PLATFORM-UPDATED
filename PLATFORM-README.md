# CSIR-BDG Complete Platform

The platform follows the supplied **CSIR BDG Platform v2** operating flow. Four connected tracks share a governed repository while remaining separate records. The HEAD BDG workspace at `/workspace` exposes every module; the focused laboratory portal exposes data entry, submissions, queries and evidence only.

## Approved v2 flow

1. **Ready-to-Transfer Technology** — lab profile → TMD TRL/CRL validation → IPU verification → AI mapping → BDG pricing/transfer decision.
2. **Sponsored Research & Problem Solving** — industry problem → AI/domain mapping → BDG/expert screening → lab proposal/costing → execution and impact.
3. **Co-Development & Industry Partnership** — consultation/challenge → capability match → joint proposal → MoU → delivery/commercialization.
4. **Data Repository & CRM** — partner record, agreements, ECF/royalty, ROI, deployment, impact, documents, alerts and analytics.

Laboratories enter and certify source facts. TMD, IPU, URDIP, ICM, CPD, IMD and BDG retain their own validation/decision lanes. See `/platform-flow` in the app.

## 1. Technology Portfolio

- **Master Technology Register** — 1,736 laboratory-wise source technologies.
- **FICCI Technology Showcase** — 225 project-only records, deliberately excluded from the Master Register.
- **Root `FICCI/` repository** — 227 preserved PDF/DOCX source documents.
- **Project Containers** — link existing technologies to projects without duplicating them.
- **Laboratory Monitoring** — open each laboratory and see its technologies, SOP state, reports and queries.

FICCI physical filenames are shortened to `FICCI/<LAB>/<DOCUMENT-ID>.<ext>` to prevent Windows path-length failures. `FICCI/manifest.json` and the database retain the original filenames and technology mapping.

## 2. Collaboration & Agreements

- **Sponsored Research** — problem intake, BDG screening, laboratory assignment, proposal and execution.
- **Industry Challenges & Partnership Pipeline** — consultation, technology gap, capability match and Head approval.
- **Co-Development Projects** — project scope, partner, PI/Co-PI, finances, milestones, deliverables, documents and commercialization.
- **Commercial Pricing** — Technology Transfer, CNP and TSP calculations based on the supplied controlled templates.
- **Central MOU Repository** — signed agreement records, versioned documents, renewal reminders and expiry alerts.

These are distinct records: a partnership can lead to a co-development project and an MOU, but the three are not merged.

## 3. SOP Governance & Automation

- Excel/PDF/Word/PowerPoint/CSV/image/text intake.
- Local extraction and validation, with optional OpenAI structured analysis.
- SOP stage recommendation and role route.
- BDG, CPD, IMD, TMD, IPU, URDIP, ICM, Lab BD and PI queues.
- Current file owner, completed steps, returns, rejection comments and timestamped movement history.
- Head technology editing and tracked laboratory correction requests.
- SOP roadmap, RACI, monthly/quarterly reporting, evidence, notifications and audit.

## Windows local setup

Extract to a short writable path such as `C:\CSIR\BDG`, not `C:\Windows\System32`.

```powershell
cd C:\CSIR\BDG
powershell -ExecutionPolicy Bypass -File .\START-CSIR.ps1
```

Manual alternative:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run db:push
npm.cmd run dev
```

Open `http://localhost:3000`. The first authenticated landing page is the HEAD BDG workspace.

## Key routes

- `/workspace` — complete module map
- `/platform-flow` — four-track v2 flow and role ownership
- `/master-technologies` — master register and revision workflow
- `/ficci` — dedicated FICCI project repository
- `/projects` — project containers
- `/module2` — sponsored research
- `/module3` — industry partnership pipeline
- `/co-development` — co-development execution
- `/commercial-engagements` — technology-transfer / consultancy pricing
- `/mou-repository` — central MOU repository
- `/ai-intake`, `/workflow-tracker` — analysis and file movement
- `/governance-dashboard`, `/sop-roadmap`, `/raci-access`
- `/head-admin`, `/lab-dashboard`, `/lab-monitoring`

## AI configuration

The app works in local analysis mode without an API key. For optional AI enrichment, set server-only values in `.env` and restart:

```env
OPENAI_API_KEY="your-key"
OPENAI_ANALYSIS_MODEL="gpt-5-mini"
```

AI output is decision support; every workflow step requires human validation.


## Free Testing Deployment

### Install and run locally

Use Node.js LTS and keep the extracted project in a short writable path (for example `C:\CSIR\BDG`).

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run db:push
npm.cmd run build
npm.cmd run start
```

The production server opens at `http://localhost:3000`. Run `npm.cmd run setup` only for a new empty database; it seeds the reference data and initial accounts.

### Required configuration

- `DATABASE_URL` — Prisma database connection. The bundled testing setup uses SQLite.
- `SESSION_SECRET` — a long random production secret.
- `SESSION_COOKIE_SECURE` — use `false` only for local HTTP; remove it or set `true` on HTTPS hosting.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — initial administrator bootstrap values; never commit real credentials.
- `UPLOAD_ROOT` — optional persistent document-upload directory.
- `FICCI_ROOT` — optional persistent FICCI source-document directory.
- `OPENAI_API_KEY` and `OPENAI_ANALYSIS_MODEL` — optional server-side AI enrichment. Do not expose the key to browser code.

Start from `.env.example`; keep the real `.env` private.

### Fast, free review link

For a short live demonstration from the same Windows computer, start the production server and a Cloudflare Quick Tunnel in separate PowerShell windows:

```powershell
npm.cmd run build
npm.cmd run start
```

```powershell
cloudflared tunnel --url http://localhost:3000
```

Share the temporary `https://...trycloudflare.com` address printed by Cloudflare. The computer, Next.js process and tunnel must stay running. Quick Tunnel URLs are temporary and are suitable for review, not permanent production hosting.

### Permanent free-tier limitations

This application combines Next.js server routes, Prisma SQLite and filesystem uploads. Serverless hosts with an ephemeral/read-only filesystem are not a safe permanent target for the current database and uploaded documents. A permanent deployment needs:

1. A persistent Node.js host for `npm.cmd run start`.
2. A managed database supported by the chosen Prisma version, with a migration from SQLite.
3. Persistent object storage for uploaded and FICCI documents.
4. HTTPS environment variables configured in the hosting dashboard.

Free tiers can sleep, limit storage/egress, or change availability. Verify those current limits with the provider before deployment. The local production build has been tested; a permanent cloud deployment is not claimed until its database and file-storage migration are completed.
