import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SyncWorker } from "@/core/sync/worker";
import type { SyncReporter, SyncTransport, TokenStore } from "@/core/types/sync";

function createMocks() {
  const reporter: SyncReporter = {
    setStatus: vi.fn(),
    setLastSynced: vi.fn(),
    setError: vi.fn(),
  };

  const transport: SyncTransport = {
    list: vi.fn().mockResolvedValue([]),
    upload: vi.fn().mockResolvedValue(undefined),
    download: vi.fn().mockResolvedValue(new Uint8Array()),
  };

  const tokenStore: TokenStore = {
    getToken: vi.fn().mockReturnValue({ accessToken: "mock-token" }),
  };

  return { reporter, transport, tokenStore };
}

describe("SyncWorker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports offline when no token", () => {
    const mocks = createMocks();
    mocks.tokenStore.getToken = vi.fn().mockReturnValue(null);

    const worker = new SyncWorker(
      mocks.reporter,
      mocks.transport,
      mocks.tokenStore,
      1000,
    );
    worker.start();

    expect(mocks.reporter.setStatus).toHaveBeenCalledWith("offline");
    expect(mocks.transport.list).not.toHaveBeenCalled();
    worker.stop();
  });

  it("calls transport.list when authenticated", () => {
    const mocks = createMocks();

    const worker = new SyncWorker(
      mocks.reporter,
      mocks.transport,
      mocks.tokenStore,
      1000,
    );
    worker.start();

    expect(mocks.reporter.setStatus).toHaveBeenCalledWith("syncing");
    expect(mocks.transport.list).toHaveBeenCalledTimes(1);
    worker.stop();
  });

  it("reports sync idle on success", async () => {
    const mocks = createMocks();

    const worker = new SyncWorker(
      mocks.reporter,
      mocks.transport,
      mocks.tokenStore,
      1000,
    );
    worker.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.reporter.setStatus).toHaveBeenCalledWith("idle");
    expect(mocks.reporter.setLastSynced).toHaveBeenCalled();
    worker.stop();
  });

  it("reports error on transport failure", async () => {
    const mocks = createMocks();
    mocks.transport.list = vi.fn().mockRejectedValue(new Error("Network error"));

    const worker = new SyncWorker(
      mocks.reporter,
      mocks.transport,
      mocks.tokenStore,
      1000,
    );
    worker.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.reporter.setStatus).toHaveBeenCalledWith("error");
    expect(mocks.reporter.setError).toHaveBeenCalledWith("Network error");
    worker.stop();
  });

  it("polls at the configured interval", async () => {
    const mocks = createMocks();

    const worker = new SyncWorker(mocks.reporter, mocks.transport, mocks.tokenStore, 100);
    worker.start();

    expect(mocks.transport.list).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(mocks.transport.list).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(100);
    expect(mocks.transport.list).toHaveBeenCalledTimes(3);

    worker.stop();
  });

  it("stop clears the timer and stops polling", async () => {
    const mocks = createMocks();

    const worker = new SyncWorker(mocks.reporter, mocks.transport, mocks.tokenStore, 100);
    worker.start();
    worker.stop();

    const callCount = mocks.transport.list.mock.calls.length;

    await vi.advanceTimersByTimeAsync(500);
    expect(mocks.transport.list).toHaveBeenCalledTimes(callCount);
  });
});
