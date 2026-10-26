# SOP Lab BD Ownership and Operator Guide - Implementation Notes

## Scope preserved

The existing Technology Portfolio, 1,736-record master register, FICCI project workspace and root FICCI document folder, Sponsored Research, Industry Partnerships, Co-Development, MOU Repository, AI Intake, Workflow Tracker, reporting, queries, notifications and administration modules remain separate and available.

## Current-state audit and correction

The former website implementation exposed LAB_FINANCE as a login role, workflow unit, AI route, admin role option, dashboard mandate and seeded account. It also repeated Finance language in the active SOP roadmap, RACI data, monthly reporting responsibility and Excel workbook used by the website. Those active actor/queue/login references have been removed.

The retired account is inactive and detached from active RBAC so historical audit relationships remain preserved. Existing LAB_FINANCE routes/events were migrated to LAB_BD. No historical workflow or audit row was deleted.

## Revised operating model

- Lab BD is the single laboratory-side owner for ECF commitments, receipt information, realisation, royalty, variance and related evidence submitted through the website.
- PI supports technical scope, milestone, deployment and impact evidence.
- BDG monitors, analyses, consolidates, flags, raises queries and escalates. BDG does not perform accounting, certify receipts or process payments.
- A laboratory may source information from its internal finance process, but that sourcing happens outside the website workflow.
- HQ units keep separate scoped roles: BDG, CPD, IMD, TMD, IPU, URDIP and ICM.

## Workbook and annexure mapping

The original supplied Word and Excel files are preserved. The website serves a separate verified workbook copy named `CSIR_ECF_Reconciliation_Value_Impact_Templates_Lab_BD_v1.xlsx`.

- Annexure I -> SOP-01 Master Technology Commercialisation Register (14 fields)
- Annexure II -> SOP-02 ECF Commitment Register (16 fields)
- Annexure III -> SOP-03 Actual Realisation Register (13 fields); Finance Confirmation is adapted to Lab BD Confirmation
- Annexure IV -> SOP-08 Variance Analysis Register (13 fields); variance is calculated and category remains a functional classification
- Annexure V -> SOP-04 Business Value (15 fields)
- Annexure VI -> SOP-05 Impact Metrics (14 fields)
- Annexure VII -> risk/escalation evidence and SOP-08 monitoring
- Annexure VIII -> SOP-07 dashboard/reporting return
- Scoring Matrix -> SOP-06 weighted 100-point score and calculated category
- Evidence Checklist -> SOP-09 provenance and certification index
- Implementation/review controls -> SOP-10

## Instructor workflow

Each SOP stage now exposes the mandatory operator sections:

A. What this SOP is for
B. When to use it
C. Who performs it
D. Prerequisites
E. Step-by-step instructions
F. Exact Excel fields and entry guidance
G. What not to enter
H. Required evidence
I. System checks
J. Submission responsibility
K. BDG action
L. Completion condition
M. Next SOP

The interactive roadmap includes stage progress, Start/Open controls, instruction/field/evidence/BDG/completion views, laboratory and technology selectors, cross-stage reuse, calculated read-only values, Save Draft, Validate & Submit and immutable record-history views.

## Data and validation architecture

- `lib/sopInstructor.js` is the controlled definition, calculation and validation layer for SOP-01 to SOP-10.
- `/api/sop-records` enforces authentication, laboratory scope, role-specific edit/submit authority, server-side source-name prefill, numeric/date checks, weighted score limits, auto-calculation and audit logging.
- `SopRecordHistory` preserves every draft, revision and submission snapshot with actor, time and reason.
- Submitted-record revision requires a reason.
- SOP-03 calculates balance and delay days.
- SOP-06 calculates total score and Category A/B/C/D.
- SOP-07 calculates balance and realisation ratio.
- SOP-08 calculates variance while keeping the functional category separate.

## Existing-database upgrade

For an older installation, run:

```powershell
npm.cmd run db:push
npm.cmd run db:migrate-lab-bd
npm.cmd run db:seed-governance
```

The migration is audit-preserving: it disables the retired login, migrates live unit names/routes and retains historical rows.

## Verification completed

- Prisma schema validation and client generation passed.
- SQLite schema push passed.
- Lab BD ownership migration and governance reseed passed.
- Next.js production build passed all 83 pages/routes.
- Authenticated regression passed admin login, ten instructor stages, server validation, draft/history/submission, Lab BD-adapted XLSX download, retired-login rejection, Lab login and Lab BD permissions.
- Database audit confirmed 1,736 master technologies, 225 FICCI project technologies, 227 FICCI source documents, zero QA records and zero active LAB_FINANCE user/role/queue references.
- Adapted workbook formula audit found zero formula-error tokens; before/after rendered sheets were visually inspected.
