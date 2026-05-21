# 4 — rusqlite with Bundled Feature for SQLite

**Status:** Accepted

**Date:** 2026-05-21

## Context

The application needs local persistence for Yjs document state, document metadata, and settings. The Rust backend (Tauri) is the natural place for this. We must decide:

- Which SQLite Rust crate to use
- Whether to use a system SQLite or bundle our own
- Table schema design

## Decision

Use **rusqlite** with the **bundled** feature flag. This compiles SQLite from source as part of the Rust build.

Reasoning:

- **No system dependency** — users don't need SQLite installed on their machine
- **Version control** — we control the SQLite version, avoiding compatibility surprises
- **Small footprint** — bundled SQLite adds ~1 MB to the binary

Table schema (single `documents` table):

```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled',
    yjs_state BLOB,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Single table is sufficient for MVP. Metadata-only queries (listing titles) don't need to load Yjs blobs.

## Consequences

**Positive:**

- Zero-config for users — database just works
- WAL mode (`PRAGMA journal_mode=WAL`) prevents read locks from blocking writes
- Prepared statements via rusqlite prevent SQL injection

**Negative:**

- Bundled SQLite adds ~5 minutes to first Rust build (compiling C code)
- Cannot use SQLite extensions or features not included in the bundled build
- Schema migrations must be managed manually (no ORM)

## Compliance

- All database access goes through `src-tauri/src/db/` module
- Tauri IPC commands are the only way frontend code accesses the database
- WAL mode is enabled on every connection
- Migrations are applied on app startup via `db:init`
