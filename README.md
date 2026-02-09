# Genius Team v9.0

[![Version](https://img.shields.io/badge/version-9.0.0-blue.svg)](https://github.com/w-3-art/genius-team/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Opus%204-purple.svg)](https://docs.anthropic.com/claude-code)

> Your AI product team. From idea to production. Powered by Agent Teams.

## What is Genius Team?

Genius Team is a collection of 21+ specialized AI skills for Claude Code that work together to build your project from start to finish:

- **Discovery** → Understanding what you want to build
- **Market Analysis** → Validating your idea
- **Specifications** → Defining requirements
- **Design** → Creating your visual identity
- **Marketing** → Planning your launch
- **Architecture** → Technical planning
- **Development** → Building the code (with Agent Teams)
- **Quality Assurance** → Testing everything
- **Security** → Auditing vulnerabilities
- **Deployment** → Going live

## What's New in v9.0

### 🤖 Agent Teams
Built on `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. The Lead orchestrates while teammates execute in parallel with git worktree isolation.

### 🧠 File-Based Memory
No external MCPs required. Memory lives in `.genius/memory/` with auto-generated BRIEFING.md (~150 lines) loaded at every session start.

### 🔄 Mandatory QA Loop
Every task goes through: Dev → QA-micro → Fix → Re-QA → ✅. Nothing ships without passing QA.

### 💰 Save-Token Mode
Toggle `/save-tokens` to use Sonnet for high-volume roles (dev, qa-micro, debugger, reviewer) while keeping Opus for lead and architect.

### 🔄 Self-Update
At session start, detects Claude Code version changes and proposes repo updates.

### ✂️ Zero Dependencies
No Vibeship, no Mind MCP, no Spawner. Pure Claude Code + file system.

## Quick Start

### One-Line Install

```bash
# Default (CLI mode)
bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) my-project

# Choose your mode
bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) my-project --mode ide
bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) my-project --mode omni
bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) my-project --mode dual
```

This will clone, configure, and guide you through setup.

### Manual Setup

```bash
git clone https://github.com/w-3-art/genius-team.git my-project
cd my-project

# CLI Mode (Claude Code terminal) — default
./scripts/setup.sh --mode cli

# IDE Mode (VS Code / Cursor)
./scripts/setup.sh --mode ide

# Omni Mode (multi-provider orchestration)
./scripts/setup.sh --mode omni

# Dual Mode (builder + challenger adversarial workflow)
./scripts/setup.sh --mode dual
```

### 2. Start a Project

Open Claude Code in your project folder and run:

```
/genius-start
```

Then say what you want to build:

```
I want to build a booking system for a hair salon
```

### 3. Let Genius Team Guide You

The AI will:
1. **Interview you** to understand your needs
2. **Analyze the market** to validate your idea
3. **Write specifications** (you approve them)
4. **Design your brand** (you choose an option)
5. **Plan the architecture** (you approve it)
6. **Build everything** autonomously with Agent Teams
7. **Test and audit** the code (mandatory QA loop)
8. **Deploy** to production

## Operating Modes

### CLI Mode (Default)
Terminal-focused. Full hook system (SessionStart, PreCompact, Stop, PostToolUse). Agent Teams via Shift+Tab.

### IDE Mode
VS Code / Cursor focused. Installs VS Code tasks and Cursor rules. No PostToolUse hooks (IDE compatibility). Agent Teams via Task().

### Omni Mode
Multi-provider routing. Claude Code leads, secondary providers (Codex, Kimi, Gemini) handle specialized tasks. Automatic fallback if providers unavailable.

### Dual Mode
Builder + Challenger adversarial workflow. One model builds, another challenges. Build-Review cycles, Discussion mode, and Audit mode. Mark tasks with 🔄 for dual review.

## Features

### 21+ Specialized Skills

| Skill | Purpose |
|-------|---------|
| genius-team | Intelligent router |
| genius-interviewer | Requirements discovery |
| genius-product-market-analyst | Market validation |
| genius-specs | Formal specifications |
| genius-designer | Brand & design system |
| genius-marketer | Go-to-market strategy |
| genius-copywriter | Marketing copy |
| genius-integration-guide | Service setup |
| genius-architect | Technical planning |
| genius-orchestrator | Autonomous execution (Agent Teams) |
| genius-dev | Code implementation |
| genius-qa | Full quality audit |
| genius-qa-micro | Quick validation |
| genius-debugger | Error fixing |
| genius-reviewer | Code review |
| genius-security | Security audit |
| genius-deployer | Deployment |
| genius-memory | Knowledge management |
| genius-onboarding | First-time setup |
| genius-test-assistant | Manual testing |
| genius-team-optimizer | Self-improvement |
| genius-updater | Claude Code version tracking |

### Memory System

All memory is file-based, no external services needed:

```
.genius/memory/
├── BRIEFING.md          # Auto-generated project summary (~150 lines)
├── decisions.json       # Key decisions with rationale
├── patterns.json        # Code patterns and conventions
├── progress.json        # Task progress (7-day window)
├── errors.json          # Resolved errors and solutions
└── session-logs/        # Session logs (30-day retention)
```

### Two-Phase Workflow

**Phase 1: IDEATION** (Conversational)
- Skills ask questions
- You approve at checkpoints
- Documents are generated

**Phase 2: EXECUTION** (Autonomous)
- Agent Teams execute in parallel
- Mandatory QA loop after every task
- Progress tracked in plan.md and PROGRESS.md

## Commands

| Command | Description |
|---------|-------------|
| `/genius-start` | Initialize environment and show status |
| `/status` | Show current progress |
| `/continue` | Resume from where you left off |
| `/reset` | Start over (with backup) |
| `/hydrate-tasks` | Reload tasks from plan.md |
| `/save-tokens` | Toggle save-token mode |
| `/update-check` | Check for Claude Code updates |
| `/omni-status` | Show provider statuses (Omni mode) |
| `/dual-status` | Show dual engine state (Dual mode) |
| `/dual-challenge` | Trigger Challenger review (Dual mode) |

## Project Structure

```
your-project/
├── CLAUDE.md                    # Project instructions (mode-specific)
├── configs/
│   ├── cli/                     # CLI mode configs + CLAUDE.md
│   ├── ide/                     # IDE mode configs + CLAUDE.md
│   ├── omni/                    # Omni mode configs + CLAUDE.md
│   └── dual/                    # Dual mode configs + CLAUDE.md
├── .claude/
│   ├── settings.json            # Permissions, hooks & env
│   ├── commands/                # Slash commands
│   ├── agents/                  # Subagent definitions
│   ├── skills/                  # 21+ Genius Team skills
│   └── plan.md                  # Task list (single source of truth)
├── .genius/
│   ├── config.json              # Team configuration
│   ├── state.json               # Project state tracking
│   ├── claude-code-version.txt  # Version tracking for updater
│   └── memory/                  # File-based memory system
│       ├── BRIEFING.md          # Auto-generated summary
│       ├── decisions.json
│       ├── patterns.json
│       ├── progress.json
│       ├── errors.json
│       └── session-logs/
├── scripts/
│   ├── setup.sh                 # One-time setup
│   ├── verify.sh                # Verify installation
│   ├── memory-briefing.sh       # Generate BRIEFING.md
│   └── memory-extract.sh        # Extract memories from sessions
├── docs/
│   ├── GETTING-STARTED.md
│   ├── SKILLS.md
│   ├── AGENT-TEAMS.md
│   ├── MEMORY-SYSTEM.md
│   └── CLAUDE-CODE-OPUS-46.md
├── DISCOVERY.xml                # Interview findings (generated)
├── SPECIFICATIONS.xml           # Requirements (generated)
├── DESIGN-SYSTEM.html           # Design options (generated)
├── ARCHITECTURE.md              # Technical design (generated)
└── PROGRESS.md                  # Execution progress (generated)
```

## Screenshots / Demo

<!-- TODO: Add screenshots or GIF demo of Genius Team in action -->
_Coming soon — contributions welcome!_

## Requirements

- **Claude Code** (latest version recommended)
- **Claude Opus 4** (default model for all roles)
- **jq** (for memory system JSON processing)
- **Git** (for version control and worktrees)
- Node.js 18+ (for most project types)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE)

---

**Built with** 🧠 **Genius Team v9.0** — Agent Teams + File-Based Memory
