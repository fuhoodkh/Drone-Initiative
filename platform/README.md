# DI Platform (Internal) — Upload/Download Hub

This is a lightweight internal web UI so the team and stakeholders can find **each document section** with:
- a short **guide** (purpose, audience, how to write)
- **Upload** the latest approved file
- **Download** the latest approved file

Storage:
- Files are stored **locally in your browser** using IndexedDB (per device + per browser).

## Run (no build required)
Open `platform/index.html` in your browser.

## Notes
- This is not a backend system. For multi-user sharing, we can later add a server or cloud storage.
- The authoritative final files still live in `docs/90_PUBLISHED/` with versioned naming.

