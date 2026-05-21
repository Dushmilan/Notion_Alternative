import { create } from "zustand";
import type { DocumentMeta } from "@/core/types/document";

interface EditorState {
  currentPageId: string | null;
  pages: DocumentMeta[];
  setCurrentPage: (id: string) => void;
  setPages: (pages: DocumentMeta[]) => void;
  addPage: (page: DocumentMeta) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentPageId: null,
  pages: [],
  setCurrentPage: (id) => set({ currentPageId: id }),
  setPages: (pages) => set({ pages }),
  addPage: (page) => set((s) => ({ pages: [...s.pages, page] })),
}));
