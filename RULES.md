# Notion_alternative.dev — Project Rules

## Project Overview

- **Name:** Notion_alternative.dev
- **Description:** A local-first, cross-platform (Windows/Android/Linux) workspace application with block-based editing, offline capability, and Google Drive CRDT sync.
- **Stack:** Tauri v2 (Rust) + React (TypeScript) + BlockNote + SQLite + Yjs
- **Package Manager:** pnpm
- **State Management:** Zustand
- **Styling:** Tailwind CSS v4

## Coding Rules

### Naming Conventions
- **Files & Folders:** `kebab-case` for directories, `PascalCase` for components, `camelCase` for utilities/hooks
- **React Components:** `PascalCase.tsx` — one component per file
- **Types/Interfaces:** Prefix with `I` for interfaces (`IBlockData`), `T` for type aliases (`TSyncStatus`)
- **Hooks:** `use` prefix in `camelCase` (`useSyncStatus`)
- **Stores:** Suffix with `Store` (`editorStore`, `syncStore`)
- **Rust modules:** `snake_case` following Rust conventions

### Patterns
- **Components:** Split into `ui/` (dumb, presentational) and `views/` (smart, connected to state)
- **State:** Each store in its own file under `state/`. Keep stores atomic — one concern per store.
- **Editor blocks:** Each custom BlockNote block in `editor/blocks/` as its own file
- **Sync layer:** Abstract behind an interface so it can be tested/faked without Google Drive
- **Error handling:** Use Result/Option patterns in Rust. In TS, use discriminated unions for API responses
- **Imports:** Group by: 1) External libs 2) Internal absolute imports (`@/...`) 3) Relative imports (rare)

### File Structure Rule
- Keep files under 300 lines. If exceeding, split by concern.
- One feature = one directory. Group related files together.

## Do NOT Do List

- Do NOT store API keys or secrets in client-side code
- Do NOT use React Context for global state — use Zustand
- Do NOT put editor, sync, and UI logic in the same file
- Do NOT commit `.env` files (use `.env.example` as template)
- Do NOT use `any` in TypeScript — prefer `unknown` with type guards
- Do NOT use `// eslint-disable-next-line` without a comment explaining why
- Do NOT import from barrel files (`index.ts`) in internal code — import directly

## Folder Structure Reference

```
src/
├── core/           # Platform-level logic
│   ├── crdt/       # Yjs document management
│   ├── db/         # SQLite adapter (Tauri IPC wrappers)
│   └── sync/       # Google Drive API workers
├── editor/         # BlockNote editor configuration
│   ├── blocks/     # Custom block definitions
│   └── extensions/ # Toolbar, slash commands, plugins
├── ui/             # React components
│   ├── components/ # Dumb UI (buttons, modals, inputs)
│   └── views/      # Smart pages (EditorPage, SettingsPage)
└── state/          # Zustand stores
```

## AI Assistant Behavior

When I ask you to help:
1. **Ask before adding dependencies** — explain why it's needed and any alternatives
2. **Show full files** — never truncate or say "rest remains the same"
3. **Always explain changes** — briefly state what and why, not just the code
4. **Flag trade-offs** — if there are multiple approaches, tell me the options
5. **Default to simplest** — prefer the clearest solution over the cleverest
6. **Outline first** — before writing code, describe your approach for approval
