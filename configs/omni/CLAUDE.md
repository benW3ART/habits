# Genius Team v9.0 — Omni Mode

> Your AI product team. From idea to production. Multi-provider orchestration.

**Mode:** Omni (Multi-Provider Routing)
**Settings:** `configs/omni/settings.json` → `.claude/settings.json`

---

## Quick Start

**First time?** Run `/genius-start` to initialize your environment.

**Check providers:** Run `/omni-status` to see which providers are available.

**Returning?** Just say what you want to do — your BRIEFING.md has the context.

---

## Omni Mode Features

- **Multi-provider routing**: Claude Code leads, secondary providers handle specialized tasks
- **Automatic fallback**: If a provider is unavailable, Claude Code handles everything
- **Provider health check** on every session start
- **Cost optimization**: Route boilerplate to cheaper providers, keep quality-critical on Opus
- **Full hook system**: SessionStart, PreCompact, Stop, PostToolUse

### Provider Routing Table

| Task Type | Default Provider | Fallback |
|-----------|-----------------|----------|
| Architecture & Planning | Claude Code | — |
| Code Implementation | Codex CLI | Claude Code |
| Code Review & QA | Claude Code | — |
| Documentation | Kimi CLI | Claude Code |
| Research & Analysis | Gemini CLI | Claude Code |

### Available Providers

- **Claude Code** (Anthropic) — Lead orchestrator, always available
- **Codex CLI** (OpenAI) — `codex` — Fast code generation
- **Kimi CLI** (Moonshot) — `kimi` — Long-context analysis
- **Gemini CLI** (Google) — `gemini` — Research & multi-modal

All providers use **subscription-based login** (no API keys):
```bash
claude login    # Claude Max/Pro
codex login     # ChatGPT Pro/Plus
kimi auth login # Kimi subscription
gemini login    # Gemini Advanced
```

### Degradation Levels

| Level | Providers | Behavior |
|-------|-----------|----------|
| 🟢 Full Omni | All 4 | Tasks routed optimally |
| 🟡 Partial | Claude + 1-2 others | Available providers used |
| 🔵 Solo | Claude Code only | Everything on Claude Code |

---

## Agent Teams Protocol

Genius Team v9.0 uses Claude Code Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

- **Lead** (you, the main session) coordinates — never codes directly
- **Teammates** are spawned via Shift+Tab or Task() with natural language prompts
- Each teammate gets: task description, file ownership, BRIEFING.md context
- Git worktree isolation for parallel work
- Shared task list via `.claude/plan.md`
- In Omni mode, the Lead also **routes tasks** to the appropriate provider

### Subagents

| Subagent | subagent_type | Purpose |
|----------|---------------|---------|
| genius-dev | `genius-dev` | Code implementation |
| genius-qa-micro | `genius-qa-micro` | Quick 30s quality check |
| genius-debugger | `genius-debugger` | Fix errors |
| genius-reviewer | `genius-reviewer` | Quality score (read-only) |

---

## Memory System (File-Based)

No external MCPs required. All memory is file-based in `.genius/memory/`:

| File | Purpose |
|------|---------|
| `BRIEFING.md` | Auto-generated ~150 line project summary (loaded at session start) |
| `decisions.json` | Key decisions with rationale and timestamps |
| `patterns.json` | Code/project patterns and conventions |
| `progress.json` | Task progress (7-day rolling window) |
| `errors.json` | Resolved errors and their solutions |
| `session-logs/` | Compressed session logs (30-day retention) |

### Memory Protocol

- **Session start**: BRIEFING.md is auto-loaded via SessionStart hook
- **On decisions**: Append to `.genius/memory/decisions.json`
- **On errors resolved**: Append to `.genius/memory/errors.json`
- **On patterns found**: Append to `.genius/memory/patterns.json`
- **Before compaction**: `scripts/memory-extract.sh` extracts key info from session
- **BRIEFING.md regenerated** from all JSON files via `scripts/memory-briefing.sh`

### Auto-loaded Context

@.genius/memory/BRIEFING.md
@.claude/plan.md

### Memory Triggers

| Say This | Effect |
|----------|--------|
| "Remember that..." | Appends to decisions.json |
| "We decided..." | Appends to decisions.json |
| "This broke because..." | Appends to errors.json |
| "Pattern: ..." | Appends to patterns.json |

---

## QA Loop (Mandatory)

After EVERY task, `genius-qa-micro` runs. A task is NOT complete until QA passes:

```
Dev → QA-micro → Fix (if needed) → Re-QA → ✅
```

---

## Save-Token Mode

Toggle with `/save-tokens`. When enabled, high-volume roles (dev, qa-micro, debugger, reviewer) use Sonnet instead of Opus. Lead and architect always use Opus.

---

## Two Phases

### Phase 1: IDEATION (Conversational)
Skills ASK questions. User input expected at checkpoints.

### Phase 2: EXECUTION (Autonomous)
Agent Teams EXECUTE without stopping. In Omni mode, tasks are routed to the best available provider.

```
genius-orchestrator (Lead, coordinates + routes):
├── genius-dev → Codex CLI (or Claude Code fallback)
├── genius-qa-micro → Claude Code (always)
├── genius-debugger → Claude Code (always)
└── genius-reviewer → Claude Code (always)

Then: genius-qa → genius-security → genius-deployer
```

---

## Commands

| Command | What It Does |
|---------|-------------|
| `/genius-start` | Initialize environment, load memory, show status |
| `/omni-status` | Show provider statuses and routing table |
| `/status` | Show current progress |
| `/continue` | Resume from last point |
| `/reset` | Start over (with backup) |
| `/hydrate-tasks` | Reload tasks from plan.md |
| `/save-tokens` | Toggle save-token mode |
| `/update-check` | Check for Claude Code updates |
| `STOP` / `PAUSE` | Halt autonomous execution |

---

## Key Files

| File | Purpose |
|------|---------|
| `.claude/plan.md` | **Single source of truth** for task list |
| `.genius/state.json` | Project state tracking |
| `.genius/config.json` | Team configuration (models, memory settings) |
| `.genius/memory/BRIEFING.md` | Auto-generated project context |
| `PROGRESS.md` | Real-time execution status |

---

## Checkpoints (User Input Required)

1. **After Specs**: "Specifications complete. Ready for design phase?"
2. **After Designer**: "Which design option do you prefer?"
3. **After Architect**: "Architecture complete. Ready to start building?"

All other transitions happen automatically.

---

## Important Rules

1. **IDEATION Phase**: Ask questions, validate understanding, get approval at checkpoints
2. **EXECUTION Phase**: Never stop, handle errors, keep going until ALL tasks complete
3. **Always update** PROGRESS.md and plan.md after each task
4. **Memory**: Read BRIEFING.md at session start, update JSON files during work
5. **QA Loop**: Every task must pass genius-qa-micro before completion
6. **Agent Teams**: Lead coordinates, teammates execute — never mix roles
7. **Omni routing**: Route to cheapest capable provider; Claude Code for quality-critical
