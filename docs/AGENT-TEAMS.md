# Agent Teams Guide

## Overview

Genius Team v9.0 uses Claude Code's experimental Agent Teams feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) for parallel, coordinated execution.

## How It Works

### The Lead

The **Lead** (genius-orchestrator) is the main session that coordinates work:
- Reads the task list from `.claude/plan.md`
- Spawns teammates for each task
- Tracks progress and handles errors
- **Never writes code directly** — only delegates

### Teammates

**Teammates** are spawned via the Task() tool:
- `genius-dev` — Implements code
- `genius-qa-micro` — Quick quality validation (30 seconds)
- `genius-debugger` — Fixes errors
- `genius-reviewer` — Scores code quality (read-only)

Each teammate:
- Runs in a forked context (`context: fork`)
- Gets specific task description and file ownership
- Reads `@.genius/memory/BRIEFING.md` for project context
- Has restricted tool access (defined in skill frontmatter)

### Git Worktree Isolation

For parallel work, the Lead can use git worktrees:
```bash
git worktree add ../project-feature-auth -b feature/auth
git worktree add ../project-feature-dashboard -b feature/dashboard
```

Each teammate works in its own worktree, preventing file conflicts.

## Spawning a Teammate

```javascript
Task({
  description: "Implement user authentication",
  prompt: `Read @.genius/memory/BRIEFING.md for project context.

Task: Implement login and registration pages.

Requirements:
- Use Supabase Auth
- Email + password authentication
- Form validation with error messages
- Loading states

Files to create:
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/components/features/auth/LoginForm.tsx
- src/components/features/auth/RegisterForm.tsx

Verification:
- TypeScript compiles
- Forms render correctly
- Auth flow works end-to-end`,
  subagent_type: "genius-dev"
})
```

## The QA Loop

After EVERY task, a QA check is mandatory:

```
Dev → QA-micro → Pass? → ✅ Next task
                  ↓ Fail
            Debugger → QA-micro → Pass? → ✅
                                   ↓ Fail (max 3 attempts)
                              Mark [!] blocked, continue
```

This ensures no broken code accumulates during execution.

## Task Synchronization

### plan.md as Source of Truth

All tasks live in `.claude/plan.md` with status markers:
- `[ ]` — Pending
- `[~]` — In Progress (assigned to a teammate)
- `[x]` — Completed (QA passed)
- `[!]` — Blocked (failed after 3 attempts)

### Sync-Back Protocol

The Lead updates plan.md after each task:
1. Before task: `[ ]` → `[~]`
2. After QA pass: `[~]` → `[x]`
3. After failure: `[~]` → `[!]`

### Resuming

If the session is interrupted:
1. Run `/genius-start` or `/continue`
2. The Lead reads plan.md and BRIEFING.md
3. Finds the first `[ ]` or `[~]` task
4. Resumes execution from that point

## Configuration

### Environment Variable

Set automatically via `.claude/settings.json`:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Save-Token Mode

Toggle with `/save-tokens` to use Sonnet for high-volume roles:
- Dev, QA-micro, Debugger, Reviewer → Sonnet (cheaper, faster)
- Lead, Architect, Interviewer → Opus (always, for quality)

## Best Practices

1. **Keep tasks atomic** — Each task should be < 30 minutes and independently verifiable
2. **Clear file ownership** — No two concurrent teammates should modify the same file
3. **Include BRIEFING.md** — Always reference it in teammate prompts
4. **Trust the QA loop** — Don't skip it, even for "simple" tasks
5. **Let execution flow** — Don't interrupt unless truly necessary (STOP command)

## Troubleshooting

### Teammates not spawning
- Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set
- Check `.claude/settings.json` env block

### Context lost between tasks
- Read BRIEFING.md at the start of each teammate prompt
- Use plan.md for task state, not session memory

### Parallel conflicts
- Use git worktrees for parallel file editing
- Ensure tasks have clear, non-overlapping file ownership
