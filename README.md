# Drone Initiative — Summer Drone Program (Oman)

This repository is the **single platform** for building and running the **Summer Drone Program** end-to-end:
- **Documents**: proposal, sponsorship, registration, investment deck, operations, curriculum, safety, budget, MoUs, media kit.
- **Brand & design system**: logo, colors, typography, document templates.
- **Web platform**: a simple internal UI where each section includes guidance + **Upload/Download** of the latest file.

---

## Quick start (team workflow)

1) **Start in `docs/00_HUB/`**
- Read `docs/00_HUB/WORKFLOW.md` (how we write, name, review, and approve).
- Use the templates in `docs/10_TEMPLATES/`.

2) **Write / update content**
- Draft in Markdown first (fast review).
- Export final as PDF using the HTML print templates in `docs/20_PRINT_TEMPLATES/` (or your office tool).

3) **Publish**
- Place approved files in `docs/90_PUBLISHED/` following naming rules.
- Upload the final file into the **Platform** section for the same document so stakeholders always find “the latest” in one place.

---

## Repository map

- `docs/00_HUB/` — workflow, roles, checklists, glossary
- `docs/10_TEMPLATES/` — document templates (AR/EN)
- `docs/20_PRINT_TEMPLATES/` — modern printable HTML templates (brand-aligned)
- `docs/30_BRAND/` — logo, colors, typography, UI/doc tokens
- `docs/40_PROGRAM/` — curriculum, schedule, venue, safety
- `docs/50_COMMERCIAL/` — sponsorship, budget, pricing, packages
- `docs/60_LEGAL/` — MoUs, consent forms, policies
- `docs/70_OPERATIONS/` — ops plan, procurement, logistics, vendor mgmt
- `docs/80_MEDIA/` — media kit, social templates, press release
- `docs/90_PUBLISHED/` — approved and final deliverables
- `platform/` — internal web UI (sections + upload/download)

---

## Languages
- Primary: **Arabic**
- Secondary: **English**

We keep **AR-first** templates, with matching EN versions where needed.

---

## Hosting notes (Render / static platforms)

- The `platform/` app is a **static front-end** (no backend yet) and can be hosted on Render as a static site.
- File uploads are stored **locally in each user’s browser (IndexedDB)**; teams should:
  - Use **online Google Docs/Drive links** per section for collaborative editing.
  - Use the built‑in **Export backup / Import backup** buttons to sync snapshots between devices if needed.


