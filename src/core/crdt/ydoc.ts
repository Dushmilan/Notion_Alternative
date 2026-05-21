import * as Y from "yjs";

const docs = new Map<string, Y.Doc>();

export function createDoc(id: string): Y.Doc {
  const existing = docs.get(id);
  if (existing) return existing;

  const doc = new Y.Doc({ guid: id });
  docs.set(id, doc);
  return doc;
}

export function getDoc(id: string): Y.Doc | undefined {
  return docs.get(id);
}

export function destroyDoc(id: string): void {
  const doc = docs.get(id);
  if (doc) {
    doc.destroy();
    docs.delete(id);
  }
}

export function applyUpdate(doc: Y.Doc, update: Uint8Array): void {
  Y.applyUpdate(doc, update);
}

export function encodeState(doc: Y.Doc): Uint8Array {
  return Y.encodeStateAsUpdate(doc);
}
