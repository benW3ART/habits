# Dual Mode — Builder + Challenger

**Status:** ✅ Available in Genius Team v9.0

Two AI models working in complementary roles: one builds, one challenges. The result is code that's been adversarially reviewed before you even see it.

---

## How It Works

```
  ┌──────────────────────────────────────────────────┐
  │                  USER TASK                        │
  │         "Implement auth middleware"               │
  └──────────────────────┬───────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────┐
  │              BUILDER (Claude Opus)                │
  │  Plans → Architects → Implements → Tests         │
  └──────────────────────┬───────────────────────────┘
                         │ writes .genius/dual-review-request.md
                         ▼
  ┌──────────────────────────────────────────────────┐
  │            CHALLENGER (Codex / Kimi / Gemini)     │
  │  Reviews → Scores → Finds Issues → Verdict       │
  └──────────────────────┬───────────────────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         APPROVE   REQUEST_CHANGES  REJECT
           │          │              │
           ▼          ▼              ▼
      ✅ Done    🔄 Builder       🚨 Escalate
                  fixes →          to user
                  next cycle
```

### Build-Review Cycle (Primary)
1. Builder receives task and implements
2. Challenger reviews independently, produces a scored verdict
3. `APPROVE` → done. `REQUEST_CHANGES` → Builder fixes, repeat. `REJECT` → user decides.
4. Hard cap at `DUAL_MAX_ROUNDS` (default: 3) to prevent infinite loops

### Discussion Mode
When Builder and Challenger disagree on **approach** (not just implementation):
1. Builder proposes Approach A with rationale
2. Challenger proposes Approach B with rationale
3. Up to 3 rounds of structured debate
4. If no convergence → both approaches presented to user

### Audit Mode
Challenger performs independent comprehensive audit:
- Test suite verification
- Security audit (OWASP Top 10, secrets, dependencies)
- Performance analysis
- Spec compliance check

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DUAL_BUILDER_MODEL` | `opus` | Builder model identity |
| `DUAL_CHALLENGER_MODEL` | `codex` | Challenger model/CLI to use |
| `DUAL_MAX_ROUNDS` | `3` | Max build-review cycles before escalation |
| `DUAL_CHALLENGER_PROFILE` | `balanced` | Review strictness profile |

### Challenger Profiles

| Profile | Threshold | Checks | Best For |
|---------|-----------|--------|----------|
| `strict` | 90/100 | Full suite + security + perf | Production releases, public APIs |
| `balanced` | 70/100 | Tests + basic security | Regular feature development |
| `lenient` | 50/100 | Tests only | Prototypes, internal tools, rapid iteration |

### Supported Challenger Models

The Challenger can be any CLI-accessible model:

| CLI | Install | Notes |
|-----|---------|-------|
| `codex` | `npm i -g @openai/codex` | OpenAI Codex CLI (default) |
| `kimi` | `npm i -g kimi-cli` | Moonshot Kimi |
| `gemini` | `npm i -g @google/gemini-cli` | Google Gemini |
| `claude` | (built-in) | Fallback — uses Claude with challenger system prompt |

If the configured CLI isn't installed, the engine falls back to Claude Code with the `genius-challenger` agent prompt. This means **Dual Mode works even with only Claude Code installed**.

---

## When to Use Dual Mode

### ✅ Use Dual Mode For
- Security-sensitive features (auth, payments, data handling)
- Complex algorithms where edge cases matter
- Public API design (breaking changes are expensive)
- Pre-release audits
- Architectural decisions with long-term impact

### ❌ Skip Dual Mode For
- Simple refactors and renames
- Documentation updates
- Typo fixes
- Early-stage prototyping (use `lenient` profile or skip entirely)
- Tasks where speed matters more than perfection

---

## Cost Implications

| Mode | Token Usage | Wall-Clock Time |
|------|-------------|-----------------|
| Normal (CLI) | 1x baseline | 1x |
| Dual (1 cycle) | ~2x baseline | ~1.5x |
| Dual (3 cycles) | ~4-5x baseline | ~3x |
| Dual Audit | ~3x baseline | ~2x |

**Tip:** Use `lenient` profile for low-stakes tasks to keep costs down while still getting a second opinion.

---

## Commands

| Command | Description |
|---------|-------------|
| `/dual-status` | Show current dual engine state, cycle count, models, last verdict |
| `/dual-challenge` | Manually trigger a Challenger review of current work |
| `/dual-challenge strict` | Trigger review with profile override |

---

## File-Based Communication

All Builder↔Challenger communication happens through files:

| File | Purpose |
|------|---------|
| `.genius/dual-state.json` | Engine state (active, mode, cycle, models) |
| `.genius/dual-review-request.md` | Builder's handoff to Challenger |
| `.genius/dual-verdict.md` | Challenger's review verdict |
| `.genius/dual-discussion.md` | Discussion mode debate log |
| `.genius/dual-audit-report.md` | Audit mode comprehensive report |

---

## Examples

### Build-Review Cycle
```
User: "Implement JWT auth middleware" (marked with 🔄 in plan.md)

Builder: Implements middleware, writes tests, signals ready
Challenger: Reviews → Score 62/100 → REQUEST_CHANGES
  - Critical: Token expiry not checked
  - Important: Missing rate limiting
  
Builder: Fixes both issues, adds rate limiting
Challenger: Reviews → Score 85/100 → APPROVE
  - Minor: Consider refresh token rotation (noted for later)

✅ Task complete in 2 cycles
```

### Discussion Mode
```
User: "Design the caching strategy"

Builder: Proposes Redis with 5-min TTL
Challenger: Counter-proposes in-memory LRU + Redis fallback
  - Round 1: Builder argues simplicity, Challenger argues latency
  - Round 2: Both agree on hybrid approach
  
✅ Converged: In-memory LRU (hot data) + Redis (shared state)
```

### Audit Mode
```
User: "/dual-challenge strict" (before release)

Challenger runs full audit:
  - Tests: 142 passed, 0 failed
  - Security: B+ (one low-severity finding)
  - Performance: A (no bottlenecks detected)
  - Spec Compliance: 96%

Verdict: CONDITIONAL_PASS
  - Fix: Sanitize user input in /api/search endpoint
```

---

## Setup

```bash
./scripts/setup.sh --mode dual
```

This installs the dual settings.json, sets up the challenger agent, and checks for available provider CLIs.

---

## Architecture Notes

- The dual engine is a **skill** (`.claude/skills/genius-dual-engine/`), not a mode change
- The challenger is an **agent** (`.claude/agents/genius-challenger.md`) spawned via Task
- State is file-based — no external services or databases needed
- The engine integrates with existing genius-reviewer (scoring rubric) and genius-qa (test patterns) skills without duplicating them
- Works within Claude Code's Agent Teams framework (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
