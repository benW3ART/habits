# Omni Mode — Multi-Provider Orchestration

**Status:** ✅ Available in Genius Team v9.0

## What Is Omni Mode?

Omni mode enables Genius Team to orchestrate **multiple AI providers** simultaneously, with Claude Code as the lead orchestrator and secondary providers handling specialized tasks:

- **Claude Code** (Anthropic) — Lead orchestrator, architecture, complex reasoning, code review, QA
- **Codex CLI** (OpenAI) — Fast code generation and refactoring
- **Kimi CLI** (Moonshot) — Long-context analysis and documentation
- **Gemini CLI** (Google) — Research and multi-modal tasks

**Key principle:** Claude Code can do everything alone. Omni mode is an optimization — not a requirement. If no secondary providers are installed, it works in "Solo Mode" with full capability.

---

## Installation

### 1. Setup Omni Mode

```bash
./scripts/setup.sh --mode omni
```

### 2. Authenticate Claude Code (required)

```bash
claude login         # Uses your Claude Max/Pro subscription
```

### 3. Install Secondary Providers (all optional)

#### Codex CLI (OpenAI)
```bash
npm install -g @openai/codex
codex login          # Uses your ChatGPT Pro/Plus subscription
```

#### Kimi CLI (Moonshot)
```bash
npm install -g kimi-cli
kimi auth login      # Uses your Kimi subscription
```

#### Gemini CLI (Google)
```bash
npm install -g @google/gemini-cli
gemini login         # Uses your Gemini Advanced subscription
```

#### Aider (Optional — pair programming)
```bash
pip install aider-chat
```

> **💡 No API keys needed!** All secondary providers authenticate via OAuth/login using your existing subscription. You pay a flat monthly fee ($20-200/mo) — NOT per-token API pricing. This is the key cost advantage of Omni mode.

### 3. Verify Installation

In Claude Code, run:
```
/omni-status
```

---

## Configuration

Omni mode uses `configs/omni/settings.json`, which extends the CLI config with:

- **Additional Bash permissions** for `codex`, `kimi`, `gemini`, `aider`
- **Provider health check** on session start
- **Environment variables** for all provider API keys
- `GENIUS_TEAM_MODE=omni`

### Authentication

Each provider uses subscription-based login (OAuth). No API keys to manage:

```bash
codex login          # Authenticates with your OpenAI account
kimi auth login      # Authenticates with your Kimi account
gemini login         # Authenticates with your Google account
```

Auth tokens are stored locally by each CLI. Re-login when they expire.

---

## Routing Table

| Task Type | Default Provider | Fallback | Rationale |
|-----------|-----------------|----------|-----------|
| Architecture & Planning | Claude Code | — | Requires deep reasoning |
| Code Implementation | Codex CLI | Claude Code | Fast, cost-effective for routine code |
| Code Review | Claude Code | — | Needs correctness reasoning |
| Documentation | Kimi CLI | Claude Code | Excellent at long-context writing |
| Research & Analysis | Gemini CLI | Claude Code | Strong research & multi-modal |
| QA & Testing | Claude Code | — | Requires intent understanding |

### Routing Examples

**Building a REST API:**
1. Architecture & endpoint design → Claude Code
2. CRUD implementation for each endpoint → Codex CLI
3. API documentation → Kimi CLI
4. Technology choice research (DB, auth) → Gemini CLI
5. Code review → Claude Code
6. Test writing → Claude Code

**Refactoring a legacy codebase:**
1. Analysis & refactoring plan → Claude Code
2. Mechanical refactoring (renaming, restructuring) → Codex CLI
3. Updated documentation → Kimi CLI
4. Code review of changes → Claude Code

---

## Cost Comparison

| Provider | Model | Relative Cost | Best For |
|----------|-------|--------------|----------|
| Claude Code | Opus 4.6 | $$$ | Quality-critical tasks |
| Codex CLI | GPT-4.1 | $$ | Volume code generation |
| Kimi CLI | Kimi K2 | $ | Documentation, summaries |
| Gemini CLI | Gemini 2.5 Pro | $$ | Research, analysis |

### Cost Optimization Strategy
- **Small projects (<500 lines):** Stay on Claude Code — routing overhead isn't worth it
- **Medium projects:** Route documentation and boilerplate to cheaper providers
- **Large projects:** Full routing — significant savings on implementation and docs

---

## Degradation Levels

| Level | Providers Available | What Happens |
|-------|-------------------|--------------|
| 🟢 Full Omni | All 4 | Tasks routed optimally by type and cost |
| 🟡 Partial Omni | Claude Code + 1-2 others | Available providers used; rest falls back |
| 🔵 Solo Mode | Claude Code only | Everything runs on Claude Code (full capability) |

---

## Commands

| Command | Description |
|---------|-------------|
| `/omni-status` | Show all provider statuses, versions, API keys |
| `/genius-start` | Start a project (works in all modes) |
| `/status` | Show current project status |

---

## Skill Reference

The routing logic lives in `.claude/skills/genius-omni-router/SKILL.md`. This skill:
- Defines the provider registry and routing table
- Includes health check procedures
- Documents fallback logic
- Provides cost tracking guidelines
- Integrates with the existing genius-team and genius-orchestrator skills

---

## FAQ

**Q: Do I need all providers installed?**
A: No. Claude Code alone is fully functional. Each additional provider is optional.

**Q: What if a provider fails mid-task?**
A: Claude Code picks up where it left off. All secondary provider output is reviewed by Claude Code before integration.

**Q: Can I add custom providers?**
A: Yes — add their CLI command to `settings.json` permissions and update the routing table in the SKILL.md.

**Q: Is there overhead to routing?**
A: Minimal. The orchestrator classifies the task type (which it does anyway) and checks provider availability (~1 second). For small tasks, the overhead isn't worth it — Claude Code handles them directly.
