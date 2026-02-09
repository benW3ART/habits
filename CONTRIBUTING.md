# Contributing to Genius Team

Thank you for your interest in contributing to Genius Team!

## How to Contribute

### Reporting Issues

1. Check existing issues first
2. Include Claude Code version (`claude --version`)
3. Include Genius Team version (9.0.0)
4. Provide steps to reproduce
5. Include output of `bash scripts/verify.sh`

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `bash scripts/verify.sh` to validate
5. Test with `/genius-start`
6. Submit a pull request

### Skill Development

When creating or modifying skills:

1. Follow the SKILL.md format with YAML frontmatter
2. Include Memory Integration section (file-based, NOT Mind MCP)
   - Session start: Read `@.genius/memory/BRIEFING.md`
   - Decisions: Append to `.genius/memory/decisions.json`
   - Errors: Append to `.genius/memory/errors.json`
   - Patterns: Append to `.genius/memory/patterns.json`
3. Include Handoffs section
4. Test with Claude Code latest version
5. Ensure compatibility with Agent Teams

### Code Style

- Use descriptive names
- Keep skills focused (single responsibility)
- Document all handoffs between skills
- Use the hydration pattern for task persistence
- No references to Mind MCP, Spawner, or Vibeship

### Memory System

All memory operations use file-based JSON:
- **DO**: Append to `.genius/memory/decisions.json`
- **DON'T**: Use `mind_recall()`, `mind_log()`, `mind_search()`, `mind_remind()`

### Testing Changes

After any modification:
```bash
# Validate JSON files
for f in .genius/memory/*.json .genius/config.json .genius/state.json .claude/settings.json; do
  jq . "$f" > /dev/null 2>&1 && echo "OK: $f" || echo "BROKEN: $f"
done

# Check for Mind MCP references
grep -rl "mind_recall\|mind_log\|mind_search\|mind_remind" .claude/skills/ && echo "FAIL: Mind MCP references found" || echo "OK: No Mind MCP references"

# Run full verification
bash scripts/verify.sh
```

## Questions?

Open an issue or check [docs/](docs/).
