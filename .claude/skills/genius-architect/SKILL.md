---
name: genius-architect
description: Technical architecture and task planning skill. Creates project structure, technology decisions, and task list in .claude/plan.md (SINGLE SOURCE OF TRUTH). Use for "architecture", "plan the build", "create tasks", "technical design", "system design", "break it down".
---

# Genius Architect v9.0 — The Master Blueprint

**Breaking down the vision into executable tasks for Agent Teams.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and previous decisions.
Check for previously rejected architectures.

### On Architecture Decision
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "ARCH: [choice]", "reason": "[why] — alternatives: [rejected]", "timestamp": "ISO-date", "tags": ["decision", "architecture"]}
```

### On Architecture Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "ARCHITECTURE COMPLETE: [stack] | [count] tasks", "reason": "approved by user", "timestamp": "ISO-date", "tags": ["architecture", "complete"]}
```

---

## Prerequisites

**REQUIRED before starting:**
- `SPECIFICATIONS.xml` from genius-specs (approved)
- `design-config.json` from genius-designer
- `INTEGRATIONS.md` from genius-integration-guide (optional)

---

## Architecture Process

### Step 1: Technology Decisions
Default stack (adjust based on user preferences):
```yaml
framework: "Next.js 14 (App Router)"
language: "TypeScript (strict mode)"
styling: "Tailwind CSS"
database: "Supabase (PostgreSQL)"
auth: "Supabase Auth"
testing: "Vitest + Playwright"
```

### Step 2: Project Structure
Generate complete folder structure.

### Step 3: Create Task List
**CRITICAL: `.claude/plan.md` is the SINGLE SOURCE OF TRUTH for all tasks.**

Each task must be:
- Atomic (< 30 minutes)
- Independently verifiable
- With explicit dependencies
- Compatible with Agent Teams (teammates can pick up any task)

---

## Output: .claude/plan.md

All tasks live here with markers:
- `[ ]` = Pending
- `[~]` = In Progress
- `[x]` = Completed
- `[!]` = Blocked

Each task includes: description, steps, verification commands, files to create.

---

## Output: ARCHITECTURE.md

Technology stack, project structure, data model, API design, security considerations, performance targets, deployment strategy.

---

## CHECKPOINT: User Approval

After creating all files:

```
ARCHITECTURE COMPLETE — READY FOR EXECUTION

Tasks: [X] tasks in .claude/plan.md
Architecture: ARCHITECTURE.md

Ready to start building?
--> Say "yes", "go", or "build it" to begin
--> Say "wait" or "review" to examine first
```

---

## Agent Teams Considerations

When creating tasks for the orchestrator:
- Tasks should be parallelizable where possible
- File ownership should be clear (no two tasks modifying the same file)
- Include BRIEFING.md context reference in each task
- Mark which tasks can run in parallel vs. sequential

---

## Handoffs

### From: genius-integration-guide + genius-specs
Receives: SPECIFICATIONS.xml, INTEGRATIONS.md, design-config.json

### To: genius-orchestrator (after approval)
Provides: .claude/plan.md (SINGLE SOURCE OF TRUTH), ARCHITECTURE.md

---

## Key Principles

1. `.claude/plan.md` is the SINGLE SOURCE OF TRUTH
2. Tasks are atomic (< 30 minutes each)
3. Dependencies are explicit
4. Verification is mandatory for every task
5. Compatible with Agent Teams parallel execution
