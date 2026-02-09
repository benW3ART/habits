# Genius Team v9.0 — Dual Mode

> Your AI product team. Builder + Challenger adversarial workflow.

**Mode:** Dual (Builder + Challenger)
**Settings:** `configs/dual/settings.json` → `.claude/settings.json`

---

## Quick Start

**First time?** Run `/genius-start` to initialize your environment.

**Check dual engine:** Run `/dual-status` to see Builder/Challenger configuration.

**Returning?** Just say what you want to do — your BRIEFING.md has the context.

---

## Dual Mode Features

- **Builder + Challenger**: Two models work in complementary roles — one builds, one challenges
- **Build-Review cycles**: Builder implements → Challenger reviews → iterate until approved
- **Discussion mode**: Structured debate when approaches diverge
- **Audit mode**: Independent comprehensive audit via `/dual-challenge`
- **File-based communication**: All state in `.genius/dual-*.md` and `.genius/dual-state.json`
- **Full hook system**: SessionStart, PreCompact, Stop, PostToolUse

### Build-Review Cycle

```
Builder (Claude Opus) → implements task
         ↓
Challenger (Codex/Kimi/Gemini/Claude) → reviews independently
         ↓
    APPROVE → ✅ Done
    REQUEST_CHANGES → Builder fixes → re-review (max 3 rounds)
    REJECT → escalate to user
```

### Challenger Profiles

| Profile | Threshold | Best For |
|---------|-----------|----------|
| `strict` | 90/100 | Production releases, public APIs |
| `balanced` | 70/100 | Regular feature development |
| `lenient` | 50/100 | Prototypes, rapid iteration |

### When to Use Dual Review

Mark tasks with 🔄 in `plan.md` to trigger dual review:
```markdown
- [ ] 🔄 Implement JWT auth middleware
- [ ] Update README (no dual review needed)
```

---

## Dual Commands

| Command | What It Does |
|---------|-------------|
| `/dual-status` | Show engine state, cycle count, models, last verdict |
| `/dual-challenge` | Manually trigger Challenger review of current work |
| `/dual-challenge strict` | Trigger review with profile override |

### Dual Communication Files

| File | Purpose |
|------|---------|
| `.genius/dual-state.json` | Engine state (active, mode, cycle, models) |
| `.genius/dual-review-request.md` | Builder's handoff to Challenger |
| `.genius/dual-verdict.md` | Challenger's review verdict |
| `.genius/dual-discussion.md` | Discussion mode debate log |
| `.genius/dual-audit-report.md` | Audit mode comprehensive report |

---

## Agent Teams Protocol

Genius Team v9.0 uses Claude Code Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

- **Lead** (you, the main session) coordinates — never codes directly
- **Builder** is the primary implementation agent (Claude Opus)
- **Challenger** reviews independently (Codex, Kimi, Gemini, or Claude with challenger prompt)
- **Teammates** are spawned via Shift+Tab or Task() with natural language prompts
- Git worktree isolation for parallel work
- Shared task list via `.claude/plan.md`

### Subagents

| Subagent | subagent_type | Purpose |
|----------|---------------|---------|
| genius-dev | `genius-dev` | Code implementation (Builder) |
| genius-qa-micro | `genius-qa-micro` | Quick 30s quality check |
| genius-debugger | `genius-debugger` | Fix errors |
| genius-reviewer | `genius-reviewer` | Quality score (read-only) |
| genius-challenger | `genius-challenger` | Adversarial review (Challenger) |

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

In Dual mode, tasks marked with 🔄 also go through the Challenger review cycle.

---

## Save-Token Mode

Toggle with `/save-tokens`. When enabled, high-volume roles (dev, qa-micro, debugger, reviewer) use Sonnet instead of Opus. Lead and architect always use Opus.

**Note:** Dual mode uses ~2-5x more tokens than CLI mode due to the review cycles. Use `lenient` profile for low-stakes tasks.

---

## Two Phases

### Phase 1: IDEATION (Conversational)
Skills ASK questions. User input expected at checkpoints.

### Phase 2: EXECUTION (Autonomous)
Agent Teams EXECUTE without stopping. Tasks marked 🔄 go through Build-Review cycles.

```
genius-orchestrator (Lead, coordinates):
├── genius-dev (Builder, implements)
├── genius-challenger (Challenger, reviews 🔄 tasks)
├── genius-qa-micro (validates all tasks)
├── genius-debugger (fixes issues)
└── genius-reviewer (scores quality)

Then: genius-qa → genius-security → genius-deployer
```

---

## All Commands

| Command | What It Does |
|---------|-------------|
| `/genius-start` | Initialize environment, load memory, show status |
| `/dual-status` | Show dual engine state and configuration |
| `/dual-challenge` | Manually trigger Challenger review |
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
| `.genius/dual-state.json` | Dual engine state |
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
7. **Dual Review**: Mark critical tasks with 🔄 in plan.md for adversarial review
