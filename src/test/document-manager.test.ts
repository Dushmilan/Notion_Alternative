import { describe, it, expect, vi, beforeEach } from "vitest";
import { DocumentManager } from "@/core/document/manager";
import type { PersistenceAdapter } from "@/core/document/persistence";

function createMockPersistence(): PersistenceAdapter {
  return {
    load: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("DocumentManager", () => {
  let persistence: PersistenceAdapter;
  let manager: DocumentManager;

  beforeEach(() => {
    persistence = createMockPersistence();
    manager = new DocumentManager(persistence, 10);
  });

  it("opens a doc and returns it", () => {
    const doc = manager.open("test-1");
    expect(doc).toBeDefined();
    expect(doc.guid).toBe("test-1");
  });

  it("returns the same doc for the same id", () => {
    const doc1 = manager.open("test-1");
    const doc2 = manager.open("test-1");
    expect(doc1).toBe(doc2);
  });

  it("get returns undefined for unknown id", () => {
    expect(manager.get("nonexistent")).toBeUndefined();
  });

  it("get returns the open doc", () => {
    const doc = manager.open("test-1");
    expect(manager.get("test-1")).toBe(doc);
  });

  it("close destroys the doc and removes it", async () => {
    manager.open("test-1");
    await manager.close("test-1");
    expect(manager.get("test-1")).toBeUndefined();
  });

  it("loads persisted state on open if available", async () => {
    const state = new Uint8Array([1, 2, 3]);
    persistence.load = vi.fn().mockResolvedValue(state);

    const doc = manager.open("test-1");
    expect(persistence.load).toHaveBeenCalledWith("test-1");
    expect(doc).toBeDefined();
  });

  it("saves on close", async () => {
    manager.open("test-1");
    await manager.close("test-1");
    expect(persistence.save).toHaveBeenCalledWith("test-1", expect.any(Uint8Array));
  });

  it("does not call close twice", async () => {
    manager.open("test-1");
    await manager.close("test-1");
    await manager.close("test-1");
    expect(persistence.save).toHaveBeenCalledTimes(1);
  });
});
