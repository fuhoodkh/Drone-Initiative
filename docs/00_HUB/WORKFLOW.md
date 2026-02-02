# Workflow (Single Platform)

## Purpose
This project succeeds only if **everyone uses one source of truth**. This repository is that source:
- Drafting, reviewing, and approving documents
- Brand consistency (logo, colors, typography)
- A platform UI to **Upload/Download** the latest approved file for each section

---

## Document lifecycle

### 1) Draft (Markdown)
- Write in `docs/10_TEMPLATES/` (copy template → new draft).
- Use Markdown for fast review and version control.

### 2) Review (team + owner)
- Reviewer checks the **checklist** in `docs/00_HUB/REVIEW_CHECKLIST.md`.
- Owner applies changes.

### 3) Approve (final)
- Export to PDF (preferred for distribution).
- Place final in `docs/90_PUBLISHED/`.
- Upload the final file into the Platform section for that document.

---

## Naming & versioning

### Folder rules
- **Drafts** live under `docs/10_TEMPLATES/` or the relevant working folder.
- **Only approved** files go into `docs/90_PUBLISHED/`.

### File naming pattern (required)
Use:
`DI_<DocCode>_<AR|EN>_<YYYY-MM-DD>_v<MAJOR.MINOR>.pdf`

Examples:
- `DI_PROPOSAL_AR_2026-02-02_v1.0.pdf`
- `DI_SPONSORSHIP_AR_2026-02-05_v1.1.pdf`

Doc codes:
- `PROPOSAL` (initiative proposal)
- `SPONSORSHIP` (sponsorship pack)
- `REGISTRATION` (registration pack)
- `INVEST_DECK` (investment pitch deck)
- `OPS` (operations plan)
- `SAFETY` (safety plan)
- `BUDGET` (budget model)
- `MOU` (partner MoU)
- `MEDIAKIT` (media kit)

---

## Ownership & approvals

### Approval gates
- **Content owner**: correct, complete, aligned to goals
- **Brand owner**: matches style guide and templates
- **Program owner**: feasible timeline, curriculum, safety
- **Legal/Policy owner** (when needed): consent, privacy, MoUs

---

## Platform alignment (Upload/Download)

Every document section in the platform must contain:
- **Purpose**: why this document exists
- **Audience**: who reads it
- **Inputs**: what data it needs
- **Output**: what “good” looks like
- **Upload button**: upload latest approved file
- **Download button**: download latest approved file

