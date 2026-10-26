# Interactive Governance Revision

This revision responds to the Head & Admin workflow review.

## Changes

- Fixed the Excel import crash. Workbooks are parsed through a server-safe temporary file, every failure returns JSON, wrong workbooks show detected sheet names, and the UI no longer crashes on empty/non-JSON responses.
- Replaced static monitoring counters with clickable filters.
- Clicking any laboratory row now opens a lab workspace containing every master technology, PI/theme/TRL/IP details, project links, recent reports and open queries.
- Legacy master records are separated from active SOP tracking. The 1,736 imported records are no longer falsely shown as both SOP-complete and missing evidence.
- Added a ten-stage SOP file/handoff roadmap derived from the supplied SOP.
- Head & Admin can edit SOP stage objective, mandatory status and Responsible/Accountable/Consulted/Informed ownership.
- Added a separate Role Access / RACI screen with Head-only editing and audit logging.
- Reworked Head dashboard cards into direct action links.
- Added responsive interaction styling, drawers, modals, workflow steps and clearer labels.
- Configured the Turbopack root to avoid the duplicate-lockfile workspace warning.

## New routes

- `/sop-roadmap`
- `/raci-access`
- `/api/sop/stages/[id]`
- `/api/raci/[id]`

## Verified

- Production build: passed (73 routes/pages)
- Approved Excel template preview: HTTP 200
- Wrong workbook: HTTP 400 with a clear JSON explanation and detected sheets
- CSIR-NPL laboratory drill-down: 53 technologies
- SOP roadmap: 10 stages
- RACI ownership: 14 activities
- Head SOP edit API: HTTP 200
- Head RACI edit API: HTTP 200
