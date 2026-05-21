# Session Log

## Session 2026-05-21

### Done

- Analyzed Research.html architectural blueprint
- Made architectural decisions: Recipe A (Web-Familiar stack), name "Notion_alternative.dev", full local-first MVP with Drive sync
- Scaffolded Tauri v2 + React 19 + TypeScript project via `create-tauri-app`
- Configured Tailwind CSS v4 with Inter font and Notion-inspired palette
- Installed all dependencies: BlockNote 0.51, Yjs 13.6, Zustand 5, Tailwind CSS 4.3
- Created full directory structure (`src/core/`, `src/editor/`, `src/ui/`, `src/state/`, `src-tauri/src/db/`, `src-tauri/src/commands/`)
- Wrote 4 Zustand stores: uiStore, editorStore, syncStore, settingsStore
- Wrote Yjs CRDT layer: ydoc.ts (factory) + merge.ts (delta computation)
- Wrote Google Drive sync client: auth.ts, drive.ts (REST wrappers), worker.ts (poll loop)
- Wrote SQLite IPC wrappers in TS: queries.ts
- Wrote Rust backend: lib.rs (5 commands), db/mod.rs (rusqlite + WAL + migrations)
- Created UI shell: Sidebar, SyncIndicator, EditorPage
- Wrote project config: RULES.md, .gitignore, .env.example
- Set up tracking system: ADRs (5 records), CHANGELOG.md, progress.md, spec directory, issue templates, CI workflow
- Verified: `pnpm tsc --noEmit` passes clean, `pnpm vite build` produces optimized bundle

### Blockers

- Rust/Tauri native compilation requires Visual Studio Build Tools (MSVC linker). The `winget install` was slow; user should install "Desktop development with C++" workload manually.
- Alternatively, install modern 64-bit MinGW-w64 and switch to GNU toolchain.

### Decisions

- **Framework:** Tauri v2 + React/TS (ADR-001)
- **Editor:** BlockNote on TipTap (ADR-002)
- **CRDT:** Yjs with binary encoding (ADR-003)
- **Database:** rusqlite bundled, WAL mode, single documents table (ADR-004)
- **Sync:** Google Drive appDataFolder, polling worker (ADR-005)
- **State:** Zustand (atomic stores, not React Context)
- **Package manager:** pnpm

### Next Session

1. Install MSVC toolchain (or MinGW-w64) to compile Rust backend
2. Wire BlockNote into `Editor.tsx` with Yjs collaboration extension
3. Test editor — create, edit, and save documents
4. Connect Yjs update observer to auto-save via `db:save_document`
