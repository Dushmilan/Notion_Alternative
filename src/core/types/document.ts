export interface DocumentMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: string;
  title: string;
  blocks: unknown[];
  createdAt: number;
  updatedAt: number;
}
