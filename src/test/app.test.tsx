import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import * as Y from "yjs";

const { mockInitDb, mockListDocuments } = vi.hoisted(() => ({
  mockInitDb: vi.fn(),
  mockListDocuments: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/core/db/queries", () => ({
  initDb: mockInitDb,
  listDocuments: mockListDocuments,
}));

const { mockOpen } = vi.hoisted(() => ({
  mockOpen: vi.fn(),
}));

vi.mock("@/core/document/manager", () => ({
  documentManager: {
    open: mockOpen,
    close: vi.fn(),
  },
}));

beforeEach(() => {
  mockInitDb.mockReset();
  mockOpen.mockReset();
  const doc = new Y.Doc();
  doc.guid = "page-1";
  mockOpen.mockReturnValue(doc);
});

describe("App", () => {
  it("initializes the database on mount", async () => {
    const { default: App } = await import("@/App");
    render(<App />);
    expect(mockInitDb).toHaveBeenCalledTimes(1);
  });
});
