# 1 — Tauri v2 as Cross-Platform Framework

**Status:** Accepted

**Date:** 2026-05-21

## Context

We are building a local-first workspace application targeting Windows, Linux, and Android. The app needs:

- Native file system access (SQLite database files)
- Small executable size (target < 50 MB)
- Ability to run Google Drive OAuth and make REST API calls
- Cross-platform consistency without pixel-perfect requirements

Three frameworks were evaluated in depth (see Research.html §1).

## Decision

Use **Tauri v2** with React + TypeScript as the frontend layer.

Alternatives considered:

- **Flutter** — heavier memory footprint (Impeller/Skia). Guarantees pixel-perfect rendering but larger binary. Less AI training data for Dart.
- **KMP + Compose** — superb Android performance but desktop support is still maturing. Significantly less LLM training data for AI-assisted development.

Tauri v2 was chosen because:

1. **LLM training data density** — the sheer volume of React/TypeScript/HTML content in training data makes AI-assisted development significantly more productive
2. **Binary size** — leverages OS-native WebView, resulting in ~5 MB executable
3. **Rust backend** — safe, fast native code for SQLite and file I/O
4. **Tauri mobile** — Android support is production-ready in v2

## Consequences

**Positive:**

- AI tools (Copilot, Cursor, etc.) are far more effective with React/TS than Flutter/Dart
- Small download size, fast installs
- Full access to npm ecosystem (BlockNote, Yjs, Zustand, etc.)

**Negative:**

- Rendering depends on OS WebView — subtle differences between Windows WebView2 and Android System WebView
- Touch interactions on mobile may need additional work compared to Flutter's first-class touch support
- Requires Rust compilation toolchain on the development machine (MSVC on Windows, GCC on Linux)

## Compliance

- All UI code must be React/TypeScript
- Tauri's IPC (`invoke`) is the only bridge between frontend and Rust backend
- No Electron, no NW.js, no alternative desktop wrappers
