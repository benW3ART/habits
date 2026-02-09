# IDE Mode

**For:** VS Code, Cursor, and other IDE-based Claude Code integrations

IDE mode adapts Genius Team for editor environments where Claude Code runs as an extension rather than a standalone terminal.

## What It Does

- Installs VS Code tasks for memory operations (briefing, extract, setup, verify)
- Installs Cursor rules (`.cursorrules`) for Cursor IDE
- Uses the same hook system as CLI, adapted for IDE context
- Same permissions and environment variables

## Setup

```bash
./scripts/setup.sh --mode ide
```

This copies:
- `configs/ide/settings.json` → `.claude/settings.json`
- `configs/ide/tasks.json` → `.vscode/tasks.json`
- `configs/ide/.cursorrules` → `.cursorrules`

## VS Code Tasks

Once installed, open the Command Palette (`Cmd+Shift+P`) and run:

- **Genius: Generate Memory Briefing** — Regenerate BRIEFING.md
- **Genius: Extract Memories** — Extract memories from current session
- **Genius: Setup** — Re-run IDE setup
- **Genius: Verify** — Verify installation

## Cursor

The `.cursorrules` file tells Cursor about Genius Team conventions, the memory system, and skill locations. It references `CLAUDE.md` for full project context.

## Requirements

- VS Code or Cursor with Claude Code extension
- jq
- Git
