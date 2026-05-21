import { useEffect } from "react";
import { useUIStore } from "@/state/uiStore";
import { useEditorStore } from "@/state/editorStore";
import type { DocumentMeta } from "@/core/types/document";

const mockPages: DocumentMeta[] = [
  { id: "1", title: "Getting Started", updatedAt: Date.now(), createdAt: Date.now() },
  { id: "2", title: "Project Notes", updatedAt: Date.now(), createdAt: Date.now() },
  { id: "3", title: "Meeting Log", updatedAt: Date.now(), createdAt: Date.now() },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { currentPageId, setCurrentPage, pages, setPages } = useEditorStore();

  useEffect(() => {
    if (pages.length === 0) {
      setPages(mockPages);
    }
  }, [pages.length, setPages]);

  const displayPages = pages.length > 0 ? pages : mockPages;

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
        {displayPages.map((page) => (
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
      </div>
    </nav>
  );
}
