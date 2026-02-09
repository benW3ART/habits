# Claude Code + Opus 4 Features Used in Genius Team v9.0

## Overview

Genius Team v9.0 is built on Claude Code's latest features, with Opus 4 as the default model for all roles.

---

## Key Features Used

### 1. Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- Lead orchestrator coordinates without coding
- Teammates spawned via Task() with `subagent_type`
- Git worktree isolation for parallel work
- Natural language delegation via Shift+Tab

### 2. Forked Context (`context: fork`)
Subagent skills run in isolated contexts:
```yaml
---
context: fork
agent: genius-dev
---
```

### 3. Custom Agents (`agent:` field)
Skills specify which agent type executes them:
- `genius-dev` — Implementation agent
- `genius-qa-micro` — Quick validation agent
- `genius-debugger` — Error fixing agent
- `genius-reviewer` — Code review agent (read-only)

### 4. Skills Frontmatter
Full YAML frontmatter with:
- `name`, `description` — Skill identity
- `context: fork` — Isolation mode
- `agent:` — Which agent runs it
- `user-invocable:` — Show in slash menu (true) or internal only (false)
- `allowed-tools:` — Per-skill tool restrictions
- `skills:` — Sub-skills loaded by this skill
- `hooks:` — Lifecycle hooks (PreToolUse, PostToolUse, Stop)

### 5. Hooks
```json
{
  "hooks": {
    "SessionStart": [{"type": "command", "command": "..."}],
    "PreCompact":   [{"type": "command", "command": "..."}],
    "Stop":         [{"type": "command", "command": "..."}],
    "PostToolUse":  [{"matcher": "Write|Edit", "hooks": [...]}]
  }
}
```

### 6. Wildcard Permissions
```json
"Bash(npm *)", "Bash(git *)", "Read(*)", "Write(*)"
```

### 7. Task Tool with subagent_type
```javascript
Task({
  description: "Implement auth",
  prompt: "...",
  subagent_type: "genius-dev"
})
```

### 8. Environment Variables in settings.json
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "GENIUS_TEAM_VERSION": "9.0.0"
  }
}
```

### 9. Hot Reload
Skills can be updated without restarting Claude Code.

### 10. Task Hydration Pattern
- `.claude/plan.md` = Persistent task source of truth
- Task markers: `[ ]`, `[~]`, `[x]`, `[!]`
- Sync-back on every task completion

---

## Opus 4 as Default

All roles default to Opus 4 for maximum quality:
- **Lead/Architect/Interviewer**: Always Opus (planning requires reasoning)
- **Dev/QA/Debugger/Reviewer**: Opus by default, Sonnet when `/save-tokens` enabled

## Save-Token Mode

Toggle with `/save-tokens`:
- **OFF** (default): All roles use Opus
- **ON**: Dev, QA-micro, Debugger, Reviewer use Sonnet; Lead/Architect stay Opus

---

## What Changed from v8.0

| v8.0 | v9.0 |
|------|------|
| Mind MCP (external) | File-based memory (.genius/memory/) |
| Spawner MCP (external) | Removed — not needed |
| Simple subagents | Agent Teams with Lead + Teammates |
| Optional QA | Mandatory QA loop after every task |
| Sonnet default + Opus option | Opus default + save-token Sonnet option |
| Vibeship dependency | Zero external dependencies |
| Manual version tracking | Auto-detect Claude Code updates |
