import { useEffect, useMemo } from "react";
import { useCreateBlockNote, BlockNoteViewRaw } from "@blocknote/react";
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

  const fragment = useMemo(() => doc.getXmlFragment("blocknote"), [doc]);

  const editor = useCreateBlockNote({
    collaboration: {
      fragment,
      user: { name: "Me", color: "#ff0000" },
    },
  });

  return <BlockNoteViewRaw editor={editor} />;
}
