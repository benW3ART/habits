# CLI Mode

**For:** Claude Code in the terminal

This is the default mode. It uses Claude Code's full hook system (SessionStart, PreCompact, Stop, PostToolUse) for automatic memory management.

## What It Does

- Loads memory briefing at every session start
- Extracts memories before context compaction
- Tracks task progress on session stop
- Logs file changes via PostToolUse

## Setup

```bash
./scripts/setup.sh --mode cli
```

## Requirements

- Claude Code (terminal)
- jq
- Git
