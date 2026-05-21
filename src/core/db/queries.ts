import { invoke } from "@tauri-apps/api/core";

export interface DocumentRow {
  id: string;
  title: string;
  yjs_state: number[];
  created_at: string;
  updated_at: string;
}

export async function initDb(): Promise<void> {
  await invoke("db:init");
}

export async function saveDocument(
  id: string,
  title: string,
  yjsState: Uint8Array,
): Promise<void> {
  await invoke("db:save_document", {
    id,
    title,
    yjsState: Array.from(yjsState),
  });
}

export async function loadDocument(id: string): Promise<Uint8Array | null> {
  const result = await invoke<number[] | null>("db:load_document", { id });
  if (!result) return null;
  return new Uint8Array(result);
}

export async function listDocuments(): Promise<
  { id: string; title: string; updatedAt: string }[]
> {
  return await invoke("db:list_documents");
}

export async function deleteDocument(id: string): Promise<void> {
  await invoke("db:delete_document", { id });
}
