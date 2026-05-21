import type { SyncReporter, SyncTransport, TokenStore } from "@/core/types/sync";
import { googleDriveTransport } from "./drive";
import { getToken } from "./auth";
import { useSyncStore } from "@/state/syncStore";

function zustandSyncReporter(): SyncReporter {
  return {
    setStatus(status) {
      useSyncStore.getState().setStatus(status);
    },
    setLastSynced(ts) {
      useSyncStore.getState().setLastSynced(ts);
    },
    setError(msg) {
      useSyncStore.getState().setError(msg);
    },
  };
}

const defaultTokenStore: TokenStore = { getToken };

export class SyncWorker {
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private reporter: SyncReporter;
  private transport: SyncTransport;
  private tokenStore: TokenStore;
  private pollIntervalMs: number;

  constructor(
    reporter: SyncReporter = zustandSyncReporter(),
    transport: SyncTransport = googleDriveTransport,
    tokenStore: TokenStore = defaultTokenStore,
    pollIntervalMs = 30000,
  ) {
    this.reporter = reporter;
    this.transport = transport;
    this.tokenStore = tokenStore;
    this.pollIntervalMs = pollIntervalMs;
  }

  start(): void {
    if (this.pollTimer) return;

    const poll = async () => {
      if (!this.tokenStore.getToken()) {
        this.reporter.setStatus("offline");
        return;
      }

      try {
        this.reporter.setStatus("syncing");
        await this.transport.list();
        this.reporter.setStatus("idle");
        this.reporter.setLastSynced(Date.now());
      } catch (err) {
        this.reporter.setStatus("error");
        this.reporter.setError(err instanceof Error ? err.message : "Sync failed");
      }
    };

    poll();
    this.pollTimer = setInterval(poll, this.pollIntervalMs);
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
