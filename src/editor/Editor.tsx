import { useEffect, useMemo } from "react";
import { documentManager } from "@/core/document/manager";

interface EditorProps {
  documentId: string;
}

export default function Editor({ documentId }: EditorProps) {
  const doc = useMemo(() => documentManager.open(documentId), [documentId]);

  useEffect(() => {
    return () => {
      documentManager.close(documentId);
    };
  }, [documentId]);

  return (
    <div className="min-h-[500px]">
      <div className="text-sm text-gray-500 mb-6">
        Editor connected — Yjs doc{" "}
        <code className="bg-[#EBEBEA] px-1 rounded">{doc.guid}</code>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-600">
          BlockNote editor will render here. Yjs document is initialized and ready for
          collaborative block editing.
        </p>
      </div>
    </div>
  );
}
