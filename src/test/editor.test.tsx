import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import * as Y from "yjs";
import Editor from "@/editor/Editor";

const { mockOpen, mockClose } = vi.hoisted(() => ({
  mockOpen: vi.fn(),
  mockClose: vi.fn(),
}));

vi.mock("@/core/document/manager", () => ({
  documentManager: {
    open: mockOpen,
    close: mockClose,
  },
}));

beforeEach(() => {
  mockOpen.mockReset();
  mockClose.mockReset();
  const doc = new Y.Doc();
  doc.guid = "page-1";
  mockOpen.mockReturnValue(doc);
});

describe("Editor", () => {
  it("opens the Yjs document via DocumentManager on mount", () => {
    render(<Editor documentId="page-1" />);
    expect(mockOpen).toHaveBeenCalledWith("page-1");
  });

  it("renders the BlockNote editor element", () => {
    const { container } = render(<Editor documentId="page-1" />);
    const editorEl = container.querySelector("[contenteditable]");
    expect(editorEl).toBeInTheDocument();
  });
});
