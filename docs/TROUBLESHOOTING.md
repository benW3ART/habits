# Troubleshooting

## Quick Diagnostics

```bash
bash scripts/verify.sh
```

---

## Common Issues

### 1. Skills Not Loading

```bash
find .claude/skills -name "SKILL.md" | wc -l
# Should be 22 (21 core + genius-updater)
```

### 2. Memory System Not Working

```bash
# Check JSON files are valid
for f in .genius/memory/*.json; do
  jq . "$f" > /dev/null 2>&1 && echo "OK: $f" || echo "BROKEN: $f"
done

# Regenerate BRIEFING.md
bash scripts/memory-briefing.sh

# Check if jq is installed
which jq || echo "jq not found — install with: brew install jq"
```

### 3. State Not Persisting

```bash
cat .genius/state.json
# If corrupted, reinitialize:
bash scripts/setup.sh
```

### 4. Execution Stops Unexpectedly

```bash
cat PROGRESS.md
grep -c "\[ \]" .claude/plan.md  # Remaining tasks
```

Run `/continue` to resume.

### 5. Hooks Not Executing

```bash
# Validate settings.json
jq . .claude/settings.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON!"
```

### 6. Agent Teams Not Working

```bash
# Check environment variable
echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
# Should be "1"

# Check settings.json
jq '.env' .claude/settings.json
```

### 7. Mind MCP References Still Present

```bash
# These should return nothing in v9
grep -rl "mind_recall\|mind_log\|mind_search\|mind_remind" .claude/skills/
# If any results, those skills need updating
```

### 8. jq Not Found

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Windows (via chocolatey)
choco install jq
```

### 9. BRIEFING.md Empty or Wrong

```bash
# Regenerate
bash scripts/memory-briefing.sh

# Check source files have data
for f in .genius/memory/*.json; do echo "$f: $(jq length "$f" 2>/dev/null || echo ERROR) entries"; done
```

### 10. Version Check Keeps Prompting

```bash
# Update stored version
claude --version > .genius/claude-code-version.txt
```

---

## Nuclear Reset

If nothing works:

```bash
# Backup
cp -r .genius .genius.backup

# Reset memory (keep decisions/patterns)
echo '[]' > .genius/memory/progress.json
rm -f .genius/memory/session-logs/*.md

# Reset state
rm -f .genius/state.json
bash scripts/setup.sh

# Regenerate
bash scripts/memory-briefing.sh
```

---

## Getting Help

1. Run `bash scripts/verify.sh`
2. Check the docs: README.md, SKILLS.md, AGENT-TEAMS.md, MEMORY-SYSTEM.md
3. Open an issue with verify.sh output
