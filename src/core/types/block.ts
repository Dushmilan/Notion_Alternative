export type BlockType =
  | "paragraph"
  | "heading"
  | "bulletListItem"
  | "numberedListItem"
  | "toggle"
  | "image"
  | "codeBlock"
  | "quote";

export interface BlockData {
  id: string;
  type: BlockType;
  content: string;
  props?: Record<string, unknown>;
}
