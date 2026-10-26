CSIR-BDG PLATFORM — START HERE
================================

This release follows the CSIR BDG PLATFORM v2 flow. Nothing below is merged or omitted:

1. TECHNOLOGY PORTFOLIO
   - Master Technology Register (1,736 lab-wise master technologies)
   - FICCI Technology Showcase (225 project technologies)
   - Root FICCI folder (227 preserved source documents)
   - Project Containers
   - Laboratory Monitoring
   - Laboratory Data Entry Desk (source facts/evidence only)

2. COLLABORATION & AGREEMENTS
   - Sponsored Research / Problem Solving
   - Industry Challenges & Partnership Pipeline
   - Co-Development Projects
   - Commercial Pricing (Technology Transfer / CNP / TSP)
   - Central MOU Repository

3. SOP GOVERNANCE & AUTOMATION
   - AI / Local Document Analysis
   - File Movement Tracker
   - Governing-body role queues
   - SOP Roadmap and RACI
   - Monthly / Quarterly Reporting
   - Queries, Notifications and Audit

4. DATA REPOSITORY & CRM
   - Unified partner and engagement linkage
   - ECF, royalty, ROI, deployment and impact records
   - Versioned document vault, alerts and consolidated analytics

ROLE RULE
Laboratories only enter factual technology data, submit evidence, track status and
answer HQ queries. TMD validates TRL/CRL; IPU validates IP/licensing; URDIP assesses
market/value; ICM owns industry engagement; CPD/IMD validate planning/impact; BDG
coordinates decisions and the repository.

IMPORTANT DATA RULE
Master Technology, FICCI Technology, Sponsored Problem, Partnership, Co-Development,
MOU and Workflow Packet are separate database records. They may be linked, but they
are not combined into a single confusing record.

WINDOWS INSTALL
Extract this ZIP to a short path such as C:\CSIR\BDG and run:

  cd C:\CSIR\BDG
  powershell -ExecutionPolicy Bypass -File .\START-CSIR.ps1

Or manually:

  Copy-Item .env.example .env
  npm.cmd install
  npm.cmd run db:push
  npm.cmd run dev

Then open http://localhost:3000

Do not extract inside C:\Windows\System32. The FICCI files use short stored names to
avoid the Windows "Path too long" error. Original filenames remain in the manifest
and database and are shown in the application.
