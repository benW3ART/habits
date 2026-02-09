---
name: genius-updater
description: Detects Claude Code version changes and proposes repo updates. Runs at SessionStart to compare versions, fetches changelogs, and suggests modifications. Use for "check for updates", "new claude code version", "update check".
user-invocable: true
allowed-tools:
  - Read(*)
  - Write(*)
  - Edit(*)
  - Glob(*)
  - Grep(*)
  - WebSearch(*)
  - WebFetch(*)
  - Bash(claude *)
  - Bash(cat *)
  - Bash(echo *)
---

# Genius Updater v9.0 — Self-Update Protocol

**Keep your repo in sync with Claude Code evolution.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for context.

### On New Version Detected
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "CLAUDE CODE UPDATE: [old] → [new]", "reason": "new version detected", "timestamp": "ISO-date", "tags": ["updater", "version"]}
```

### On Update Applied
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "REPO UPDATED for Claude Code [version]: [changes]", "reason": "user approved", "timestamp": "ISO-date", "tags": ["updater", "applied"]}
```

---

## How It Works

### Automatic Detection (SessionStart)

The SessionStart hook compares:
- **Stored version**: `.genius/claude-code-version.txt`
- **Current version**: `claude --version`

If they differ, the hook outputs a `<version_change>` tag that prompts you to run `/update-check`.

### Manual Check: `/update-check`

1. Run `claude --version` and compare with stored version
2. If new version detected:
   - Use WebSearch to fetch changelog from official sources:
     - `https://docs.anthropic.com/claude-code/changelog`
     - Anthropic blog
     - Community posts
   - Analyze what's new (new tools, syntax changes, capabilities)
   - Propose specific repo modifications
3. Present to user:

```
🔄 Nouvelle version Claude Code détectée!

Version: {old} → {new}

Nouveautés:
- [feature 1]
- [feature 2]
- [feature 3]

Modifications proposées:
1. [change 1] — [why]
2. [change 2] — [why]
3. [change 3] — [why]

Souhaites-tu que je procède? (oui/non)
```

4. **Only apply changes after explicit approval**
5. Update `.genius/claude-code-version.txt` after successful update

---

## What Gets Updated

Depending on the changelog, the updater may propose changes to:

- `.claude/settings.json` — New permissions, hook types, env variables
- Skill frontmatter — New fields, deprecated syntax
- Agent definitions — New capabilities
- Orchestrator — New Task() features, Agent Teams improvements
- Memory scripts — New hook types for extraction

---

## Version File

`.genius/claude-code-version.txt` contains the last known Claude Code version.
Format: single line with the version string from `claude --version`.

---

## Safety Rules

1. **Never auto-apply** — Always ask for explicit approval
2. **Show diff** — Explain exactly what will change
3. **Backup first** — Create backup before modifying files
4. **Test after** — Run `bash scripts/verify.sh` after applying
5. **Log everything** — Record all changes to decisions.json

---

## Handoffs

### To genius-team-optimizer
Provides: New features that could improve skills

### From SessionStart hook
Triggered: When version mismatch detected
