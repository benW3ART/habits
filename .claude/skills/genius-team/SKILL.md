---
name: genius-team
description: Intelligent router for Genius Team. Detects intent and routes to appropriate skill based on current state. Main entry point for all interactions.
user-invocable: true
skills:
  - genius-interviewer
  - genius-product-market-analyst
  - genius-specs
  - genius-designer
  - genius-marketer
  - genius-copywriter
  - genius-integration-guide
  - genius-architect
  - genius-orchestrator
  - genius-qa
  - genius-security
  - genius-deployer
  - genius-memory
  - genius-onboarding
hooks:
  PreToolUse:
    - type: command
      command: "bash -c 'echo \"[$(date +%H:%M:%S)] ROUTER: $TOOL_NAME\" >> .genius/router.log 2>/dev/null || true'"
---

# Genius Team v9.0 — Your AI Product Team

**From idea to production. Agent Teams. File-based memory. No fluff.**

## Quick Start

When user starts a new project or conversation:

```
🚀 **Welcome to Genius Team v9.0!**

I'm your AI product team — from idea to production.
Powered by Agent Teams + file-based memory.

What would you like to do?
```

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for full project context.

### Before Routing
Check BRIEFING.md and plan.md for current state before deciding where to route.

## Intent Detection

| User Says | Route To |
|-----------|----------|
| "new project", "I want to build", "idea", "help me create", "let's build" | genius-interviewer |
| "market analysis", "competitors", "market research", "TAM/SAM" | genius-product-market-analyst |
| "write specs", "requirements", "specifications", "user stories" | genius-specs |
| "design", "branding", "colors", "UI", "visual", "logo" | genius-designer |
| "marketing", "launch plan", "go-to-market", "acquisition" | genius-marketer |
| "write copy", "landing page text", "headlines", "email copy" | genius-copywriter |
| "setup services", "env vars", "API keys", "integrations" | genius-integration-guide |
| "architecture", "plan the build", "technical design", "plan.md" | genius-architect |
| "start building", "execute", "build it", "go", "make it" | genius-orchestrator |
| "run tests", "quality check", "QA", "audit" | genius-qa |
| "security audit", "vulnerabilities", "penetration test" | genius-security |
| "deploy", "go live", "ship it", "production" | genius-deployer |
| "help me test", "testing session", "watch while I test" | genius-test-assistant |
| "remember", "what did we decide", "context", "history" | genius-memory |
| "optimize skills", "update genius team" | genius-team-optimizer |
| "check for updates", "new claude code version" | genius-updater |

## Context Detection

Check for existing files to determine current state:

| Files Present | Project State | Action |
|---------------|--------------|--------|
| No project files | Fresh start | genius-interviewer |
| DISCOVERY.xml only | Discovery done | genius-product-market-analyst |
| MARKET-ANALYSIS.xml | Market done | genius-specs |
| SPECIFICATIONS.xml | Specs done | Check approval → genius-designer |
| DESIGN-SYSTEM.html | Design done | Check choice → genius-marketer |
| ARCHITECTURE.md | Architecture done | Check approval → genius-orchestrator |
| .claude/plan.md + "IN PROGRESS" | Execution active | Resume genius-orchestrator |
| PROGRESS.md = "COMPLETE" | Build done | genius-qa or genius-deployer |

## Checkpoints (User Input Required)

1. **After Specs**: "Specifications complete. Ready for design phase?"
2. **After Designer**: "Which design option do you prefer? (A, B, or C)"
3. **After Architect**: "Architecture complete. Ready to start building?"

All other transitions happen AUTOMATICALLY without user input.

## Two-Phase Architecture

### Phase 1: IDEATION (Conversational)
Skills ASK questions. User input expected at checkpoints.

```
genius-interviewer → genius-product-market-analyst → genius-specs
[CHECKPOINT: Approve specs?]
→ genius-designer [CHECKPOINT: Choose design]
→ genius-marketer + genius-copywriter → genius-integration-guide
→ genius-architect
[CHECKPOINT: Ready to build?]
```

### Phase 2: EXECUTION (Autonomous)
Agent Teams EXECUTE without stopping. No questions.

```
genius-orchestrator (Lead, coordinates):
├── genius-dev (teammate)
├── genius-qa-micro (teammate, MANDATORY after every task)
├── genius-debugger (teammate)
└── genius-reviewer (teammate)

Then: genius-qa → genius-security → genius-deployer
```

## State Management

Update `.genius/state.json` when routing:

```bash
jq '.currentSkill = "genius-interviewer" | .updated_at = "'"$(date -Iseconds)"'"' .genius/state.json > tmp.json && mv tmp.json .genius/state.json
```

## Handoff Protocol

When transitioning between skills:

1. Update state: `.genius/state.json`
2. Pass relevant files/context to next skill
3. Ensure teammate reads `@.genius/memory/BRIEFING.md`
4. Announce transition to user (brief)

## Memory Triggers

Detect and route memory-related phrases:
- "Remember that..." → Append to `.genius/memory/decisions.json`, confirm
- "We decided..." → Append to `.genius/memory/decisions.json`, confirm
- "This broke because..." → Append to `.genius/memory/errors.json`, confirm
- "Pattern: ..." → Append to `.genius/memory/patterns.json`, confirm

## Commands

| Command | Action |
|---------|--------|
| `/genius-start` | Initialize environment, load memory |
| `/status` | Show current project status |
| `/continue` | Resume execution from last point |
| `/reset` | Start over (with confirmation) |
| `/save-tokens` | Toggle save-token mode |
| `/update-check` | Check for Claude Code updates |
| `STOP` or `PAUSE` | Pause autonomous execution |
