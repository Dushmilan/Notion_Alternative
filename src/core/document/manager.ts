import * as Y from "yjs";
import type { PersistenceAdapter } from "./persistence";
import { tauriPersistence } from "./persistence";

export class DocumentManager {
  private docs = new Map<string, Y.Doc>();
  private persistence: PersistenceAdapter;
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private loadPromises = new Map<string, Promise<void>>();
  private saveDebounceMs: number;

  constructor(persistence: PersistenceAdapter = tauriPersistence, saveDebounceMs = 500) {
    this.persistence = persistence;
    this.saveDebounceMs = saveDebounceMs;
  }

  open(id: string): Y.Doc {
    const existing = this.docs.get(id);
    if (existing) return existing;

    const doc = new Y.Doc({ guid: id });
    this.docs.set(id, doc);

    const loadPromise = this.loadInBackground(id);
    this.loadPromises.set(id, loadPromise);

    doc.on("update", () => this.scheduleSave(id));
    return doc;
  }

  get(id: string): Y.Doc | undefined {
    return this.docs.get(id);
  }

  async whenReady(id: string): Promise<void> {
    const promise = this.loadPromises.get(id);
    if (promise) await promise;
  }

  async close(id: string): Promise<void> {
    const timer = this.saveTimers.get(id);
    if (timer) clearTimeout(timer);
    this.saveTimers.delete(id);

    await this.flush(id);

    const doc = this.docs.get(id);
    if (doc) {
      doc.off("update", () => this.scheduleSave(id));
      doc.destroy();
    }
    this.docs.delete(id);
    this.loadPromises.delete(id);
  }

  private async loadInBackground(id: string): Promise<void> {
    try {
      const state = await this.persistence.load(id);
      if (state) {
        const doc = this.docs.get(id);
        if (doc) {
          Y.applyUpdate(doc, state);
        }
      }
    } catch {
      // Continue with empty doc
    }
  }

  private scheduleSave(id: string): void {
    const existing = this.saveTimers.get(id);
    if (existing) clearTimeout(existing);

    this.saveTimers.set(
      id,
      setTimeout(() => this.flush(id), this.saveDebounceMs),
    );
  }

  private async flush(id: string): Promise<void> {
    const doc = this.docs.get(id);
    if (!doc) return;

    try {
      const state = Y.encodeStateAsUpdate(doc);
      await this.persistence.save(id, state);
    } catch (err) {
      console.warn(`DocumentManager: save failed for ${id}`, err);
      this.scheduleSave(id);
    }
  }
}

export const documentManager = new DocumentManager();
