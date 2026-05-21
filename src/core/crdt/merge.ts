import * as Y from "yjs";

export function mergeUpdates(
  target: Y.Doc,
  updates: Uint8Array[],
): void {
  for (const update of updates) {
    Y.applyUpdate(target, update);
  }
}

export function computeDelta(
  doc: Y.Doc,
  lastKnownStateVector: Uint8Array | null,
): Uint8Array {
  if (!lastKnownStateVector) {
    return Y.encodeStateAsUpdate(doc);
  }
  return Y.encodeStateAsUpdate(doc, lastKnownStateVector);
}
