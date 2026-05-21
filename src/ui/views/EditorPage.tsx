import { useEditorStore } from "@/state/editorStore";
import Editor from "@/editor/Editor";

export default function EditorPage() {
  const { currentPageId, pages } = useEditorStore();

  const currentPage = pages.find((p) => p.id === currentPageId);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Select a page</p>
          <p className="text-sm mt-1">Choose a page from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <Editor documentId={currentPage.id} />
    </div>
  );
}
