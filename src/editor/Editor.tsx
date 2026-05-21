import { useEffect, useMemo } from "react";
import { createDoc, getDoc } from "@/core/crdt/ydoc";

interface EditorProps {
  documentId: string;
}

export default function Editor({ documentId }: EditorProps) {
  const doc = useMemo(() => {
    const existing = getDoc(documentId);
    if (existing) return existing;
    return createDoc(documentId);
  }, [documentId]);

  useEffect(() => {
    const updateListener = () => {
      /* Yjs doc updated — auto-save will be added in Milestone 3 */
    };

    doc.on("update", updateListener);
    return () => {
      doc.off("update", updateListener);
    };
  }, [doc]);

  return (
    <div className="min-h-[500px]">
      <div className="text-sm text-gray-500 mb-6">
        Editor connected — Yjs doc <code className="bg-[#EBEBEA] px-1 rounded">{documentId}</code>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-600">
          BlockNote editor will render here. Yjs document is initialized and
          ready for collaborative block editing.
        </p>
      </div>
    </div>
  );
}
