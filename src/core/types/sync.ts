export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface SyncBlob {
  id: string;
  documentId: string;
  data: Uint8Array;
  timestamp: number;
}

export interface SyncState {
  pendingBlobs: number;
  lastSyncedAt: number | null;
  status: SyncStatus;
}

export interface SyncReporter {
  setStatus(status: SyncStatus): void;
  setLastSynced(ts: number): void;
  setError(msg: string | null): void;
}

export interface SyncTransport {
  list(): Promise<{ id: string; name: string }[]>;
  upload(name: string, data: Uint8Array): Promise<void>;
  download(fileId: string): Promise<Uint8Array>;
}

export interface TokenStore {
  getToken(): { accessToken: string } | null;
}
