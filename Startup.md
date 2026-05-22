# Startup Guide

## Prerequisites

- **Node.js** >= 20 (for pnpm and Vite)
- **pnpm** — `npm install -g pnpm`
- **Rust** — `winget install Rust.Rustup` or from [rustup.rs](https://rustup.rs)
- **MSVC Build Tools** (Windows) — Visual Studio 2022 Build Tools with "Desktop development with C++" workload. Required to compile the Tauri/Rust backend. _Without this, Rust commands (`pnpm tauri dev` / `pnpm tauri build`) will fail._

## Quick Start

```bash
# 1. Install JS dependencies
pnpm install

# 2. Copy environment file and fill in your Google OAuth credentials
cp .env.example .env
# Edit .env — at minimum add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET
# (Sync works without these, but Google Drive sync won't authenticate)

# 3a. Full-stack (Tauri desktop app — requires MSVC toolchain)
pnpm tauri dev

# 3b. Frontend-only (Vite dev server, no Rust backend — skip DB/sync)
pnpm dev
# Opens at http://localhost:1420
```

## Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Vite dev server (frontend only, no Tauri) |
| `pnpm build`        | TypeScript check + Vite production build  |
| `pnpm preview`      | Preview production build                  |
| `pnpm test`         | Run Vitest test suite                     |
| `pnpm test:watch`   | Run tests in watch mode                   |
| `pnpm tauri dev`    | Tauri dev mode (Rust + frontend)          |
| `pnpm tauri build`  | Production build for current platform     |
| `pnpm tsc --noEmit` | TypeScript type check (no emit)           |
| `pnpm lint`         | ESLint check                              |
| `pnpm format`       | Prettier auto-format                      |

## Project Structure

```
src/
  core/          — Domain logic (CRDT, document manager, sync, DB queries)
  editor/        — BlockNote editor component and custom blocks
  state/         — Zustand stores (editor, UI, sync, settings)
  ui/            — React components (Sidebar, EditorPage, SyncIndicator)
  test/          — Vitest test files
src-tauri/
  src/           — Rust backend (SQLite, Tauri IPC commands)
  Cargo.toml     — Rust dependencies
```

## Testing

```bash
pnpm test                # Run all tests
pnpm test:watch          # Watch mode
pnpm test -- editor      # Run editor tests only
```

Tests use **Vitest** with **jsdom**. Key test files:

- `src/test/editor.test.tsx` — Editor component (BlockNote + Yjs binding)
- `src/test/document-manager.test.ts` — Yjs document lifecycle
- `src/test/sync-worker.test.ts` — Google Drive sync polling
- `src/test/uiStore.test.ts` — Zustand stores

## Troubleshooting

### Rust/Tauri won't compile

Install "Desktop development with C++" via Visual Studio Installer, or switch to MinGW-w64 GNU toolchain.

### Tests fail with "Not same Y.Doc"

The Yjs document passed to BlockNote must be the original doc (not a copy). `doc.getXmlFragment()` returns a fragment tied to that doc.

### BlockNote CSS missing

Import is in `src/index.css: @import "@blocknote/react/style.css"`. If styles are broken, ensure this import is present.

### Frontend works but DB/sync calls fail

The frontend dev server (`pnpm dev`) runs without the Rust backend. DB operations via `@tauri-apps/api` will throw in the browser console but the UI is functional for layout/editor work.
