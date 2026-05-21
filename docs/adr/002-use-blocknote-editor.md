# 2 — BlockNote as Block Editor Engine

**Status:** Accepted

**Date:** 2026-05-21

## Context

The application requires a block-based rich text editor modeled after Notion. Requirements:

- Documents composed of discrete, nestable blocks (paragraphs, headings, toggles, code blocks, etc.)
- Extensible block types — custom blocks like inline databases
- Integration with Yjs CRDT for offline-first sync
- Mobile-friendly touch interactions
- AI-friendly API surface

Four engines were evaluated (see Research.html §2).

## Decision

Use **BlockNote** (built on TipTap/ProseMirror).

Alternatives considered:

- **TipTap Core** — headless, deeply extensible but requires significant boilerplate for basic Notion-like UI. High upfront cost.
- **Lexical (Meta)** — unmatched DOM performance but complex state update paradigm causes AI hallucination without massive context
- **Editor.js** — clean JSON output but historically weak on mobile touch interactions

BlockNote was chosen because:

1. **Best "Notion-like" out-of-box experience** — blocks, nesting, drag-to-reorder, slash menu all built-in
2. **Built on TipTap/ProseMirror** — inherits ProseMirror's mature selection model and extensibility
3. **Yjs integration** — BlockNote has a built-in collaboration extension that maps cleanly to Yjs documents
4. **AI simplicity** — its schema is straightforward, reducing LLM confusion during code generation

## Consequences

**Positive:**

- Rapid development — basic block editor works in hours, not days
- Extensible via custom block schemas
- Large community and plugin ecosystem

**Negative:**

- Heavier than raw TipTap — includes UI components you may override
- ProseMirror's AST (not plain DOM) means debugging can be confusing
- Mobile support is good but not as polished as native editors

## Compliance

- All editor customization lives in `src/editor/`
- Custom blocks go in `src/editor/blocks/` — one file per block type
- Editor extensions go in `src/editor/extensions/`
- The editor component must accept a Yjs Doc as its data source
