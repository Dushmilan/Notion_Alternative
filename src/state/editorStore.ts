import { create } from "zustand";

export interface PageMeta {
  id: string;
  title: string;
  updatedAt: number;
}

interface EditorState {
  currentPageId: string | null;
  pages: PageMeta[];
  setCurrentPage: (id: string) => void;
  setPages: (pages: PageMeta[]) => void;
  addPage: (page: PageMeta) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentPageId: null,
  pages: [],
  setCurrentPage: (id) => set({ currentPageId: id }),
  setPages: (pages) => set({ pages }),
  addPage: (page) => set((s) => ({ pages: [...s.pages, page] })),
}));
