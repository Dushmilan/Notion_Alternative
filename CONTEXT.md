# Domain Language

## Workspace

A **Workspace** is the user's top-level context — the app itself. It contains **Pages**, a local **Store** (SQLite), and a **Sync Backend** (Google Drive).

## Page

A **Page** is a document the user creates and edits. It has:

- A unique **Page ID**
- A **Title**
- A **Block Tree** — the editor content, stored as a Yjs document

## Block

A **Block** is a unit of content within a Page (paragraph, heading, toggle, code block, etc.). Blocks are nestable and form a tree. Block types are defined in `src/core/types/block.ts`.

## Block Tree

The entire block content of a Page, managed by the **Editor Engine** (BlockNote/TipTap) and backed by a Yjs **CRDT Document**.

## CRDT Document

A Yjs `Y.Doc` instance that holds the Block Tree as shared data types. Each Page has exactly one CRDT Document. Changes are tracked as incremental **Deltas**.

## Delta

A binary patch produced by Yjs when the CRDT Document changes. Deltas are applied on other devices to converge the document state (CRDT merge).

## Document Manager

The module responsible for the CRDT Document lifecycle: creation, loading from the Store, binding update listeners for auto-save, and destruction. Owns the in-memory registry of open documents.

## Store

The local persistence layer — SQLite database accessed via Tauri IPC. Stores:

- **Page metadata** (title, timestamps)
- **CRDT Document snapshots** (Yjs binary state)

## Persistence Adapter

The interface between the Document Manager and the Store. Abstracts the Tauri IPC calls behind `load(id)` and `save(id, state)`.

## Sync Backend

The cloud storage used for cross-device sync — Google Drive `appDataFolder`. Handles OAuth, delta upload/download, and polling.

## Sync Reporter

The interface through which the Sync Backend reports status to the UI. Decouples sync logic from Zustand/react state.

## Sync Transport

The interface for HTTP operations against the Sync Backend. Abstracts `fetch` calls behind `list`, `upload`, `download` operations.

## Sync Worker

The polling loop that drives sync: checks for pending changes, uploads Deltas to the Sync Backend, downloads remote Deltas, and applies them to CRDT Documents.

## Token Store

Manages OAuth tokens for the Sync Backend. Provides `get`, `set`, and `clear` operations.

## Editor Engine

BlockNote running on TipTap/ProseMirror. Renders the Block Tree and translates user edits into CRDT Document mutations.
