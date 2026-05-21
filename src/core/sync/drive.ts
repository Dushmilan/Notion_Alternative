import { getToken } from "./auth";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

async function authHeaders(): Promise<Record<string, string>> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token.accessToken}` };
}

export async function listBlobs(): Promise<{ id: string; name: string }[]> {
  const headers = await authHeaders();
  const res = await fetch(
    `${DRIVE_API_BASE}/files?spaces=appDataFolder&fields=files(id,name,createdTime)`,
    { headers },
  );
  if (!res.ok) throw new Error(`Drive list failed: ${res.statusText}`);
  const data = await res.json();
  return data.files ?? [];
}

export async function uploadBlob(
  name: string,
  data: Uint8Array,
): Promise<void> {
  const headers = await authHeaders();
  const metadata = JSON.stringify({ name, parents: ["appDataFolder"] });
  const form = new FormData();
  form.append("metadata", new Blob([metadata], { type: "application/json" }));
  form.append("file", new Blob([data]));

  const res = await fetch(`${UPLOAD_BASE}/files?uploadType=multipart`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "multipart/related" },
    body: form,
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${res.statusText}`);
}

export async function downloadBlob(fileId: string): Promise<Uint8Array> {
  const headers = await authHeaders();
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
    { headers },
  );
  if (!res.ok) throw new Error(`Drive download failed: ${res.statusText}`);
  return new Uint8Array(await res.arrayBuffer());
}
