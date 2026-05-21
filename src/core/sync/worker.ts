import { getToken } from "./auth";
import { listBlobs } from "./drive";
import { useSyncStore } from "@/state/syncStore";

let pollTimer: ReturnType<typeof setInterval> | null = null;

export function startSync(pollIntervalMs = 30000): void {
  if (pollTimer) return;

  const poll = async () => {
    if (!getToken()) {
      useSyncStore.getState().setStatus("offline");
      return;
    }

    try {
      useSyncStore.getState().setStatus("syncing");
      await listBlobs();
      useSyncStore.getState().setStatus("idle");
      useSyncStore.getState().setLastSynced(Date.now());
    } catch (err) {
      useSyncStore.getState().setStatus("error");
      useSyncStore
        .getState()
        .setError(err instanceof Error ? err.message : "Sync failed");
    }
  };

  poll();
  pollTimer = setInterval(poll, pollIntervalMs);
}

export function stopSync(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
