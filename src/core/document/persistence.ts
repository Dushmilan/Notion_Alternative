import { saveDocument, loadDocument } from "@/core/db/queries";

export interface PersistenceAdapter {
  load(id: string): Promise<Uint8Array | null>;
  save(id: string, state: Uint8Array): Promise<void>;
}

export const tauriPersistence: PersistenceAdapter = {
  async load(id: string): Promise<Uint8Array | null> {
    return loadDocument(id);
  },
  async save(id: string, state: Uint8Array): Promise<void> {
    await saveDocument(id, "Untitled", state);
  },
};
