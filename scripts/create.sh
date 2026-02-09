#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Genius Team v9.0 — One-Liner Install
# Usage: bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) [project-name] [--mode cli|ide|omni|dual]
# ═══════════════════════════════════════════════════════════════
set -e

# Colors (degrade gracefully)
if [ -t 1 ] && command -v tput &>/dev/null && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
  GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
  BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'
  DIM='\033[2m'; NC='\033[0m'
else
  GREEN=''; YELLOW=''; RED=''; BLUE=''; CYAN=''; BOLD=''; DIM=''; NC=''
fi

# ── Helpers ──────────────────────────────────────────────────
info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✓${NC}  $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
fail()  { echo -e "${RED}✗${NC}  $1"; }
die()   { echo -e "\n${RED}ERROR:${NC} $1" >&2; exit 1; }

# ── Parse Arguments ──────────────────────────────────────────
PROJECT_NAME=""
MODE="cli"

while [[ $# -gt 0 ]]; do
  case $1 in
    --mode)   MODE="$2"; shift 2 ;;
    --mode=*) MODE="${1#*=}"; shift ;;
    -h|--help)
      echo "Usage: bash <(curl -fsSL URL) [project-name] [--mode cli|ide|omni|dual]"
      echo ""
      echo "  project-name   Directory name (default: genius-project)"
      echo "  --mode MODE    Setup mode: cli (default), ide, omni, dual"
      exit 0
      ;;
    -*)       die "Unknown option: $1" ;;
    *)        PROJECT_NAME="$1"; shift ;;
  esac
done

PROJECT_NAME="${PROJECT_NAME:-genius-project}"

# Validate mode
if [[ ! "$MODE" =~ ^(cli|ide|omni|dual)$ ]]; then
  die "Invalid mode: ${MODE}\nValid modes: cli, ide, omni, dual"
fi

# ── Banner ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  🧠 Genius Team v9.0 — Installer                 ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Project: ${CYAN}${PROJECT_NAME}${NC}"
echo -e "  Mode:    ${CYAN}${MODE}${NC}"
echo ""

# ── Pre-flight Checks ───────────────────────────────────────
command -v git &>/dev/null || die "Git is not installed. Please install git first.\n  macOS: xcode-select --install\n  Linux: sudo apt install git"

if [ -d "$PROJECT_NAME" ]; then
  die "Directory '${PROJECT_NAME}' already exists. Choose a different name or remove it first."
fi

# Quick connectivity check
if ! git ls-remote https://github.com/w-3-art/genius-team.git HEAD &>/dev/null 2>&1; then
  die "Cannot reach GitHub. Check your internet connection."
fi

# ── Clone ────────────────────────────────────────────────────
info "Cloning Genius Team..."
if ! git clone --quiet https://github.com/w-3-art/genius-team.git "$PROJECT_NAME" 2>/dev/null; then
  die "Git clone failed. Check your internet connection and try again."
fi
ok "Cloned into ${CYAN}${PROJECT_NAME}${NC}"

cd "$PROJECT_NAME"

# ── Fresh Git History ────────────────────────────────────────
rm -rf .git
git init --quiet
git add -A &>/dev/null
git commit -m "🧠 Initial commit — Genius Team v9.0 (${MODE} mode)" --quiet &>/dev/null
ok "Fresh git history initialized"

# ── Run Setup ────────────────────────────────────────────────
info "Running setup (${MODE} mode)..."
echo ""
chmod +x scripts/setup.sh
./scripts/setup.sh --mode "$MODE"
echo ""

# ── Dependency Check & Guide ─────────────────────────────────
echo -e "${BOLD}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  🧠 Genius Team v9.0 — Ready!                    ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${DIM}Checking your environment...${NC}"
echo ""

# Check dependencies
check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "${GREEN}$2${NC} — installed"
    return 0
  else
    fail "${RED}$2${NC} — not found"
    echo -e "     → Install: ${CYAN}$3${NC}"
    return 1
  fi
}

check_cmd git "Git" "https://git-scm.com"
check_cmd jq "jq" "brew install jq / sudo apt install jq"
check_cmd claude "Claude Code" "npm install -g @anthropic-ai/claude-code"

# Mode-specific checks and guidance
echo ""
echo -e "${BOLD}[Mode: ${CYAN}${MODE}${NC}${BOLD}]${NC}"
echo ""

case "$MODE" in
  cli)
    echo -e "  ${BOLD}Next steps:${NC}"
    echo -e "  1. ${CYAN}cd ${PROJECT_NAME}${NC}"
    echo -e "  2. Run ${CYAN}claude${NC}"
    echo -e "  3. Type ${CYAN}/genius-start${NC}"
    echo -e "  4. Tell it what you want to build! 🚀"
    ;;
  ide)
    echo -e "  ${BOLD}Next steps:${NC}"
    echo -e "  1. Open this folder in ${CYAN}VS Code${NC} or ${CYAN}Cursor${NC}"
    echo -e "  2. Start Claude Code ${DIM}(Cmd+Shift+P → \"Claude Code: Open\")${NC}"
    echo -e "  3. Type ${CYAN}/genius-start${NC}"
    echo -e "  4. Tell it what you want to build! 🚀"
    ;;
  omni)
    echo -e "  ${DIM}Checking secondary providers...${NC}"
    check_cmd codex "Codex CLI" "npm install -g @openai/codex" || true
    check_cmd kimi "Kimi CLI" "See https://github.com/anthropics/kimi" || true
    check_cmd gemini "Gemini CLI" "npm install -g @anthropic-ai/gemini" || true
    echo ""
    echo -e "  ${DIM}(Secondary providers are optional — Claude Code handles everything by default)${NC}"
    echo ""
    echo -e "  ${BOLD}Next steps:${NC}"
    echo -e "  1. ${CYAN}cd ${PROJECT_NAME}${NC}"
    echo -e "  2. Run ${CYAN}claude${NC}"
    echo -e "  3. Type ${CYAN}/genius-start${NC}"
    echo -e "  4. Use ${CYAN}/omni-status${NC} to see provider routing"
    echo -e "  5. Tell it what you want to build! 🚀"
    ;;
  dual)
    echo -e "  ${DIM}Checking challenger engines...${NC}"
    check_cmd codex "Codex CLI (challenger)" "npm install -g @openai/codex" || true
    check_cmd gemini "Gemini CLI (challenger)" "npm install -g @anthropic-ai/gemini" || true
    echo ""
    echo -e "  ${DIM}Dual mode: One model builds, another challenges.${NC}"
    echo -e "  ${DIM}Mark tasks with 🔄 to trigger dual review.${NC}"
    echo ""
    echo -e "  ${BOLD}Next steps:${NC}"
    echo -e "  1. ${CYAN}cd ${PROJECT_NAME}${NC}"
    echo -e "  2. Run ${CYAN}claude${NC}"
    echo -e "  3. Type ${CYAN}/genius-start${NC}"
    echo -e "  4. Use ${CYAN}/dual-status${NC} and ${CYAN}/dual-challenge${NC}"
    echo -e "  5. Tell it what you want to build! 🚀"
    ;;
esac

echo ""
echo -e "${DIM}─────────────────────────────────────────────────────${NC}"
echo -e "  📁 Project: ${CYAN}$(pwd)${NC}"
echo -e "  📖 Docs:    ${CYAN}docs/GETTING-STARTED.md${NC}"
echo -e "  🌐 GitHub:  ${CYAN}https://github.com/w-3-art/genius-team${NC}"
echo -e "${DIM}─────────────────────────────────────────────────────${NC}"
echo ""
echo -e "  ${GREEN}Happy building! 🧠✨${NC}"
echo ""
