import { create } from "zustand";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

interface SyncState {
  status: SyncStatus;
  lastSynced: number | null;
  errorMessage: string | null;
  setStatus: (status: SyncStatus) => void;
  setLastSynced: (ts: number) => void;
  setError: (msg: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "idle",
  lastSynced: null,
  errorMessage: null,
  setStatus: (status) => set({ status }),
  setLastSynced: (ts) => set({ lastSynced: ts }),
  setError: (msg) => set({ errorMessage: msg }),
}));
