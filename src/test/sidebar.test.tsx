import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Sidebar from "@/ui/components/Sidebar";

const { mockListDocuments, mockSaveDocument } = vi.hoisted(() => ({
  mockListDocuments: vi.fn(),
  mockSaveDocument: vi.fn(),
}));

vi.mock("@/core/db/queries", () => ({
  listDocuments: mockListDocuments,
  saveDocument: mockSaveDocument,
}));

beforeEach(() => {
  mockListDocuments.mockReset();
  mockSaveDocument.mockReset();
  mockListDocuments.mockResolvedValue([]);
});

describe("Sidebar", () => {
  it("loads pages from the database on mount", async () => {
    mockListDocuments.mockResolvedValue([
      { id: "a1", title: "Test Page A", updatedAt: 1000, createdAt: 1000 },
      { id: "b2", title: "Test Page B", updatedAt: 2000, createdAt: 1000 },
    ]);

    render(<Sidebar />);

    await waitFor(() => {
      expect(mockListDocuments).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Test Page A")).toBeInTheDocument();
    expect(screen.getByText("Test Page B")).toBeInTheDocument();
  });

  it("creates a new page when the New Page button is clicked", async () => {
    mockSaveDocument.mockResolvedValue(undefined);
    mockListDocuments.mockResolvedValueOnce([]);
    mockListDocuments.mockResolvedValueOnce([
      { id: "new-id", title: "Untitled", updatedAt: Date.now(), createdAt: Date.now() },
    ]);

    render(<Sidebar />);

    await waitFor(() => {
      expect(mockListDocuments).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /new page/i }));

    await waitFor(() => {
      expect(mockSaveDocument).toHaveBeenCalledTimes(1);
    });

    const [id, title, _state] = mockSaveDocument.mock.calls[0];
    expect(id).toEqual(expect.stringMatching(/^[\da-f-]+$/));
    expect(title).toBe("Untitled");

    await waitFor(() => {
      expect(screen.getByText("Untitled")).toBeInTheDocument();
    });
  });
});
