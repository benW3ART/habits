#!/bin/bash
# Genius Team v9.0 — Generate BRIEFING.md from memory JSON files
# Called by SessionStart hook and after memory-extract.sh
# Budget: architecture 25, decisions 25, patterns 25, errors 20, progress 30, context 15 = ~140 lines max

set -euo pipefail

MEMORY_DIR=".genius/memory"
BRIEFING="$MEMORY_DIR/BRIEFING.md"
STATE=".genius/state.json"
CONFIG=".genius/config.json"

# Helper: read JSON array length
json_len() {
  if [ -f "$1" ]; then
    jq 'length' "$1" 2>/dev/null || echo "0"
  else
    echo "0"
  fi
}

# Helper: safe jq read
safe_jq() {
  if [ -f "$1" ]; then
    jq -r "$2" "$1" 2>/dev/null || echo "$3"
  else
    echo "$3"
  fi
}

# Start building briefing
{
  echo "# Project Briefing"
  echo ""
  echo "> Auto-generated on $(date '+%Y-%m-%d %H:%M'). Do not edit manually."
  echo ""

  # ── Architecture & State (budget: 25 lines) ──
  echo "## Status"
  PHASE=$(safe_jq "$STATE" '.phase' 'NOT_STARTED')
  CURRENT_SKILL=$(safe_jq "$STATE" '.currentSkill // "none"' 'none')
  VERSION=$(safe_jq "$CONFIG" '.version' '9.0.0')
  SAVE_MODE=$(safe_jq "$CONFIG" '.models.saveTokenMode' 'false')
  echo "- **Version:** $VERSION"
  echo "- **Phase:** $PHASE"
  echo "- **Current skill:** $CURRENT_SKILL"
  echo "- **Save-token mode:** $SAVE_MODE"
  echo ""

  # Task summary from state
  TOTAL=$(safe_jq "$STATE" '.tasks.total' '0')
  COMPLETED=$(safe_jq "$STATE" '.tasks.completed' '0')
  FAILED=$(safe_jq "$STATE" '.tasks.failed' '0')
  SKIPPED=$(safe_jq "$STATE" '.tasks.skipped' '0')
  if [ "$TOTAL" -gt 0 ] 2>/dev/null; then
    echo "### Tasks: $COMPLETED/$TOTAL complete ($FAILED failed, $SKIPPED skipped)"
    echo ""
  fi

  # Artifacts
  echo "### Artifacts"
  if [ -f "$STATE" ]; then
    jq -r '.artifacts | to_entries[] | select(.value == true) | "- ✅ \(.key)"' "$STATE" 2>/dev/null || echo "- None yet"
    PENDING=$(jq -r '.artifacts | to_entries[] | select(.value == false) | .key' "$STATE" 2>/dev/null | head -5)
    if [ -n "$PENDING" ]; then
      echo "$PENDING" | while read -r art; do echo "- ⬜ $art"; done
    fi
  else
    echo "- No state file"
  fi
  echo ""

  # plan.md summary
  if [ -f ".claude/plan.md" ]; then
    echo "### Plan Summary"
    PLAN_TOTAL=$(grep -c "^- \[" .claude/plan.md 2>/dev/null || echo "0")
    PLAN_DONE=$(grep -c "^- \[x\]" .claude/plan.md 2>/dev/null || echo "0")
    PLAN_PROG=$(grep -c "^- \[~\]" .claude/plan.md 2>/dev/null || echo "0")
    PLAN_PEND=$(grep -c "^- \[ \]" .claude/plan.md 2>/dev/null || echo "0")
    PLAN_BLOCK=$(grep -c "^- \[!\]" .claude/plan.md 2>/dev/null || echo "0")
    echo "- Total: $PLAN_TOTAL | Done: $PLAN_DONE | In-progress: $PLAN_PROG | Pending: $PLAN_PEND | Blocked: $PLAN_BLOCK"
    NEXT=$(grep -m1 "^- \[ \]" .claude/plan.md 2>/dev/null | sed 's/^- \[ \] //' || true)
    if [ -n "$NEXT" ]; then
      echo "- **Next task:** $NEXT"
    fi
    echo ""
  fi

  # ── Key Decisions (budget: 25 lines) ──
  DECISIONS_COUNT=$(json_len "$MEMORY_DIR/decisions.json")
  if [ "$DECISIONS_COUNT" -gt 0 ]; then
    echo "## Key Decisions (last 10)"
    jq -r 'sort_by(.timestamp) | reverse | .[0:10][] | "- **\(.decision)** — \(.reason) [\(.tags | join(", "))] (\(.timestamp // "no date"))"' \
      "$MEMORY_DIR/decisions.json" 2>/dev/null || echo "- Error reading decisions"
    echo ""
  fi

  # ── Patterns (budget: 25 lines) ──
  PATTERNS_COUNT=$(json_len "$MEMORY_DIR/patterns.json")
  if [ "$PATTERNS_COUNT" -gt 0 ]; then
    echo "## Active Patterns (last 10)"
    jq -r 'sort_by(.timestamp) | reverse | .[0:10][] | "- **\(.pattern)** — \(.context) (\(.timestamp // "no date"))"' \
      "$MEMORY_DIR/patterns.json" 2>/dev/null || echo "- Error reading patterns"
    echo ""
  fi

  # ── Errors & Solutions (budget: 20 lines) ──
  ERRORS_COUNT=$(json_len "$MEMORY_DIR/errors.json")
  if [ "$ERRORS_COUNT" -gt 0 ]; then
    echo "## Recent Errors & Solutions (last 8)"
    jq -r 'sort_by(.timestamp) | reverse | .[0:8][] | "- ❌ **\(.error)** → ✅ \(.solution) (\(.timestamp // "no date"))"' \
      "$MEMORY_DIR/errors.json" 2>/dev/null || echo "- Error reading errors"
    echo ""
  fi

  # ── Progress (budget: 30 lines, 7-day decay) ──
  PROGRESS_COUNT=$(json_len "$MEMORY_DIR/progress.json")
  if [ "$PROGRESS_COUNT" -gt 0 ]; then
    CUTOFF=$(date -v-7d '+%Y-%m-%d' 2>/dev/null || date -d '7 days ago' '+%Y-%m-%d' 2>/dev/null || echo "2000-01-01")
    echo "## Recent Progress (7 days)"
    jq -r --arg cutoff "$CUTOFF" '
      [.[] | select(.timestamp >= $cutoff)] |
      sort_by(.timestamp) | reverse | .[0:15][] |
      "- \(.status // "done"): \(.task) (\(.timestamp // "no date"))"
    ' "$MEMORY_DIR/progress.json" 2>/dev/null || echo "- Error reading progress"
    echo ""
  fi

  # ── Context footer (budget: 15 lines) ──
  echo "## Session Context"
  echo "- **Memory files:** decisions=$DECISIONS_COUNT patterns=$PATTERNS_COUNT errors=$ERRORS_COUNT progress=$PROGRESS_COUNT"

  # Session logs count
  LOG_COUNT=$(find "$MEMORY_DIR/session-logs" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "- **Session logs:** $LOG_COUNT"

  # Checkpoints summary
  if [ -f "$STATE" ]; then
    DONE_CHECKS=$(jq '[.checkpoints | to_entries[] | select(.value == true)] | length' "$STATE" 2>/dev/null || echo "0")
    TOTAL_CHECKS=$(jq '[.checkpoints | to_entries[]] | length' "$STATE" 2>/dev/null || echo "0")
    echo "- **Checkpoints:** $DONE_CHECKS/$TOTAL_CHECKS passed"
  fi

  echo ""
  echo "---"
  echo "*Read the full JSON files in .genius/memory/ for detailed history.*"

} > "$BRIEFING"

echo "[memory-briefing] BRIEFING.md regenerated ($(wc -l < "$BRIEFING") lines)"
