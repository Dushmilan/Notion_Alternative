export interface SyncBlob {
  id: string;
  documentId: string;
  data: Uint8Array;
  timestamp: number;
}

export interface SyncState {
  pendingBlobs: number;
  lastSyncedAt: number | null;
  status: "idle" | "uploading" | "downloading" | "error";
}
