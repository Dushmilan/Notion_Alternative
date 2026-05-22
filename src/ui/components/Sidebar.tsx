import { useEffect, useCallback } from "react";
import { useUIStore } from "@/state/uiStore";
import { useEditorStore } from "@/state/editorStore";
import { listDocuments, saveDocument } from "@/core/db/queries";

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { currentPageId, setCurrentPage, pages, setPages } = useEditorStore();

  const loadPages = useCallback(() => {
    listDocuments()
      .then((docs) => {
        setPages(
          docs.map((d) => {
            const ts = new Date(d.updatedAt).getTime() || Date.now();
            return { id: d.id, title: d.title, createdAt: ts, updatedAt: ts };
          }),
        );
      })
      .catch(() => {
        // DB unavailable — show empty list
      });
  }, [setPages]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleNewPage = async () => {
    const id = crypto.randomUUID();
    await saveDocument(id, "Untitled", new Uint8Array(0));
    loadPages();
    setCurrentPage(id);
  };

  if (!sidebarOpen) return null;

  return (
    <nav className="w-64 bg-white border-r border-[#EBEBEA] flex flex-col flex-shrink-0">
      <div className="p-5">
        <h1 className="text-lg font-bold tracking-tight">Notion_alternative</h1>
        <p className="text-xs text-gray-500 mt-0.5">Local-First Workspace</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
          Pages
        </div>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(page.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm mb-0.5 transition-colors ${
              currentPageId === page.id
                ? "bg-[#EBEBEA] font-medium"
                : "hover:bg-[#EBEBEA]"
            }`}
          >
            {page.title}
          </button>
        ))}
        <button
          onClick={handleNewPage}
          className="w-full text-left px-3 py-2 rounded-md text-sm mb-0.5 mt-2 text-gray-500 hover:bg-[#EBEBEA] transition-colors"
        >
          + New Page
        </button>
      </div>
    </nav>
  );
}
