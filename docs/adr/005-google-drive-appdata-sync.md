# 5 — Google Drive appDataFolder for Sync Backend

**Status:** Accepted

**Date:** 2026-05-21

## Context

The app must synchronize documents across devices without a proprietary backend server. Requirements:

- Zero infrastructure cost (no VPS, no serverless functions)
- User privacy — app data should not be visible in the user's normal Drive UI
- Offline-first — sync is opportunistic, not required for app operation
- Binary blob storage for Yjs deltas

## Decision

Use **Google Drive `appDataFolder`** as the cloud sync backend. This is a hidden folder per-application that users cannot see in their Drive UI.

Key details:

- OAuth scope: `https://www.googleapis.com/auth/drive.appdata`
- No custom backend server required
- Files stored here count against the user's Drive quota (~500 MB per-app soft limit)
- REST API endpoints for upload, list, download

Sync flow:

1. Yjs `update` event → compute delta (`Y.encodeStateAsUpdate(doc, lastSV)`)
2. Write delta to local temp file (sync blob)
3. Sync worker polls every N seconds:
   - Upload pending blobs to Drive `appDataFolder`
   - List remote files, download new ones
   - Apply downloaded deltas via `Y.applyUpdate(doc, delta)`
4. CRDT mathematics guarantee conflict-free merge

## Consequences

**Positive:**

- No server costs — zero-infrastructure sync
- Users control their data — it's in their Google Drive
- `appDataFolder` is hidden — users can't accidentally delete sync data
- File-based approach aligns with Yjs's blob model

**Negative:**

- Requires Google account and OAuth setup
- Drive quota applies per-user
- API rate limits (~10k requests/day for most users)
- No real-time sync — polling introduces latency (30s default interval)
- If user revokes Drive access, unsynced changes are lost

## Compliance

- Google OAuth goes through Tauri's webview (via `tauri-plugin-oauth`)
- Token storage uses platform secure storage, not local storage
- Sync worker is in `src/core/sync/` — fully decoupled from editor and UI
- Sync blobs are named `{documentId}-{timestamp}.yjs` for ordering
- The sync module must degrade gracefully (offline = local-only mode, no data loss)
