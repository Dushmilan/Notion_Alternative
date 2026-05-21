# 3 — Yjs as CRDT Layer

**Status:** Accepted

**Date:** 2026-05-21

## Context

The app must support offline-first editing with conflict-free synchronization via Google Drive. This requires a CRDT (Conflict-Free Replicated Data Type) that can:

- Operate entirely offline
- Produce compact binary deltas for upload
- Merge concurrent edits from multiple devices without data loss
- Integrate with the block editor engine (BlockNote/TipTap)

Options: Yjs vs Automerge.

## Decision

Use **Yjs** as the CRDT library.

Alternatives considered:

- **Automerge** — more compact binary format, but Rust FFI is immature. The JS-only implementation is slower for large documents.

Yjs was chosen because:

1. **Native TypeScript** — no FFI, compiles cleanly with the TS frontend
2. **Proven TipTap integration** — `y-prosemirror` adapter is mature
3. **Small deltas** — Yjs update events produce incremental binary patches ideal for Drive upload
4. **y-sqlite** — persistence adapter exists for SQLite, aligning with our storage choice
5. **Ecosystem** — awareness, undo manager, and other extensions are well-maintained

## Consequences

**Positive:**

- Simple integration path: Yjs Doc ↔ y-prosemirror ↔ TipTap ↔ BlockNote
- Update events provide perfect granularity for sync (no full-state uploads)
- y-sqlite provides zero-effort local persistence

**Negative:**

- Binary format is not human-readable (can't debug by reading the file)
- Document size grows unbounded without periodic garbage collection
- Awareness protocol (cursors, selections) adds complexity for minimal MVP benefit

## Compliance

- Yjs Doc is the single source of truth for document state
- All Yjs operations go through `src/core/crdt/` — no direct Yjs API calls from UI code
- Deltas are computed via `Y.encodeStateAsUpdate(doc, previousStateVector)`
- Garbage collection strategy must be implemented before public release
