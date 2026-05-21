# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — Unreleased

### Added

- **Scaffold:** Tauri v2 project with React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS v4 with Inter font, Notion-inspired color palette (#F7F7F5, #37352F)
- **State management:** Zustand stores for editor (`editorStore`), sync (`syncStore`), UI (`uiStore`), settings (`settingsStore`)
- **CRDT layer:** Yjs document factory (`src/core/crdt/`) with create/get/destroy/encode/applyUpdate
- **SQLite backend (Rust):** `rusqlite` with bundled feature, WAL mode, documents table with schema migrations
- **IPC commands:** 5 Tauri commands — `db:init`, `db:save_document`, `db:load_document`, `db:list_documents`, `db:delete_document`
- **Google Drive sync client:** OAuth token manager, REST API wrappers for `appDataFolder` (list, upload, download), polling worker skeleton
- **Editor shell:** BlockNote wrapper with Yjs document binding, toggle block component
- **UI shell:** Sidebar with page list, EditorPage with empty/missing states, SyncIndicator component
- **Project tracking:** Architecture Decision Records (5 ADRs), CHANGELOG, session log, spec directory
- **CI:** GitHub Actions workflow to build + lint on push/PR
