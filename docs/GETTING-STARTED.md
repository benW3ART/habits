# Getting Started with Genius Team v9.0

## Prerequisites

- **Claude Code** (latest version recommended)
- **jq** — For memory system JSON processing (`brew install jq` on macOS)
- **Git** — For version control
- **Node.js 18+** — For most project types

## Setup (2 minutes)

### Step 1: Clone or Copy the Repository

```bash
git clone https://github.com/your-username/genius-team.git my-project
cd my-project
```

### Step 2: Choose Your Mode

Genius Team supports multiple modes. Pick the one that matches your workflow:

#### CLI Mode (default) — Claude Code in the terminal

```bash
./scripts/setup.sh --mode cli
```

Best for: Terminal-first developers using Claude Code directly.

#### IDE Mode — VS Code or Cursor

```bash
./scripts/setup.sh --mode ide
```

Best for: Developers who prefer working inside an editor. This installs:
- Claude Code settings adapted for IDE context
- VS Code tasks for memory operations (`Cmd+Shift+P` → `Tasks: Run Task`)
- Cursor rules (`.cursorrules`) for Cursor IDE integration

#### Omni Mode (coming soon)

```bash
./scripts/setup.sh --mode omni
```

Multi-provider orchestration: Claude Code + Codex + Kimi Code + Gemini CLI. See `configs/omni/README.md` for the roadmap.

#### Dual Mode (coming soon)

```bash
./scripts/setup.sh --mode dual
```

Two models working together: one builds, one challenges. See `configs/dual/README.md` for the roadmap.

### Step 3: Verify Installation

```bash
bash scripts/verify.sh
```

## Your First Project

### 1. Start

Open Claude Code in your project folder:
```
/genius-start
```

### 2. Describe Your Project

```
I want to build a booking system for a hair salon
```

### 3. Answer Questions

The AI interviews you:
- What problem does it solve?
- Who are your users?
- What features do you need?
- What's your timeline?

### 4. Review and Approve

At key milestones, you approve:
1. **Specifications** — "Do these specs look right?"
2. **Design** — "Which design option do you prefer?"
3. **Architecture** — "Ready to start building?"

### 5. Watch It Build

Genius Team uses Agent Teams to build autonomously:
- Lead orchestrator coordinates
- Dev teammates implement in parallel
- QA runs after every task (mandatory)
- Errors are fixed automatically

### 6. Deploy

```
Deploy to staging
```

## Key Commands

| Command | What It Does |
|---------|--------------|
| `/genius-start` | Initialize and show status |
| `/status` | Show progress |
| `/continue` | Resume from last point |
| `/reset` | Start over |
| `/save-tokens` | Toggle save-token mode |
| `/update-check` | Check for Claude Code updates |
| `STOP` | Pause execution |

## Tips

### Be Specific
Instead of: "Build me an app"
Say: "Build a task management app for freelancers with time tracking"

### Memory Triggers
- "Remember that we're using Supabase" → Saved to decisions.json
- "This broke because of CORS" → Saved to errors.json

### Let It Complete
During execution, avoid interrupting. The AI handles errors automatically via the QA loop.

## Common Issues

### jq Not Found
```bash
brew install jq        # macOS
apt install jq         # Ubuntu/Debian
```

### Skills Not Loading
```bash
find .claude/skills -name "SKILL.md" | wc -l
# Should be 22 (21 + genius-updater)
```

### Memory Not Working
```bash
# Verify JSON files are valid
for f in .genius/memory/*.json; do jq . "$f" > /dev/null && echo "OK: $f" || echo "BROKEN: $f"; done
```

## Next Steps

- Read [AGENT-TEAMS.md](AGENT-TEAMS.md) for Agent Teams deep dive
- Read [MEMORY-SYSTEM.md](MEMORY-SYSTEM.md) for memory architecture
- Read [SKILLS.md](SKILLS.md) for skill reference
