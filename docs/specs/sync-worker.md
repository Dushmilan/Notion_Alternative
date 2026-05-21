# Spec: Sync Worker

## Goal

Background process that uploads Yjs document deltas to Google Drive `appDataFolder` and downloads remote deltas from other devices, applying them to the local Yjs documents.

## Interfaces

### Types

```typescript
interface SyncBlob {
  documentId: string;
  data: Uint8Array; // Y.encodeStateAsUpdate delta
  timestamp: number; // Unix ms
}
```

### Public API (src/core/sync/worker.ts)

```typescript
startSync(pollIntervalMs?: number): void
stopSync(): void
```

## Flow

### Upload

1. Yjs Doc emits `update` event with delta (`Uint8Array`)
2. Delta is written to local file via Tauri command: `sync:write_blob({ name, data })`
3. On poll interval:
   - Check auth token is valid; refresh if expired
   - List pending local blobs via `sync:list_blobs`
   - For each blob: upload to Drive via `POST /upload/drive/v3/files?uploadType=multipart`
   - Delete local blob on success via `sync:delete_blob`
4. Update `syncStore` status

### Download

1. On poll interval:
   - List Drive `appDataFolder` via `GET /drive/v3/files?spaces=appDataFolder`
   - Compare with last-known set (stored in `syncStore`)
   - For each new file: download via `GET /drive/v3/files/{id}?alt=media`
   - Get the corresponding Yjs Doc from `src/core/crdt/ydoc.ts`
   - Apply: `Y.applyUpdate(doc, downloadedDelta)`
   - Update last-known set
2. Update `syncStore` lastSynced timestamp

## State Machine

```
IDLE → (auth check) → OFFLINE (no token) → IDLE (wait)
IDLE → SYNCING → (check token) → OFFLINE or
IDLE → SYNCING → (upload/download) → IDLE → (update lastSynced)
IDLE → SYNCING → ERROR → IDLE (retry on next poll)
```

## Edge Cases

| Case                                    | Behavior                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| No token / expired                      | Set store to `offline`, skip sync, retry next poll                                  |
| Upload fails (network)                  | Log error, retry on next poll. Blob stays local                                     |
| Download fails (network)                | Log error, retry on next poll                                                       |
| Drive quota exceeded                    | Log warning, skip uploads, keep local blobs                                         |
| Duplicate delta downloaded              | `Y.applyUpdate` is idempotent — applying same delta twice is safe                   |
| Corrupted blob                          | `Y.applyUpdate` throws — catch error, delete corrupted blob from Drive, continue    |
| Two devices edit same paragraph offline | CRDT merge guarantees no data loss. Apply updates in any order, result is identical |

## Poll Interval

Default: **30 seconds**. Configurable via `settingsStore.syncPollInterval`.

During initial sync (first launch after re-auth), poll every 5 seconds until caught up.

## Naming Convention

Drive files are named: `{documentId}_{timestamp}.yjs`

Example: `a1b2c3d4_1716326400000.yjs`

Format allows deterministic ordering by timestamp and easy grouping by document.

## Data Flow Diagram

```
┌──────────┐   update event   ┌─────────────┐
│  Yjs Doc  ├────────────────►│  Write to   │
│  (editor) │                 │  local blob  │
└──────────┘                 └──────┬──────┘
                                    │
                          poll timer ticks
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Auth check   │
                            │  (valid?)     │
                            └──────┬───────┘
                          ┌───────┴────────┐
                          ▼                ▼
                   ┌──────────┐    ┌──────────────┐
                   │ Upload   │    │ Download     │
                   │ pending  │    │ remote files │
                   │ blobs    │    │ → apply      │
                   └──────────┘    └──────────────┘
                          │                │
                          ▼                ▼
                   ┌──────────────────────────┐
                   │   Update syncStore        │
                   │   (status, lastSynced)    │
                   └──────────────────────────┘
```
