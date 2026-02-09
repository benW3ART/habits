# Changelog

## [9.0.0] - 2026-02-09

### Added
- Agent Teams integration (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS)
- File-based memory system (.genius/memory/)
- 4 operating modes: CLI, IDE, Omni, Dual
- 21+ specialized skills
- Mandatory QA loop (dev → qa-micro → fix → re-qa)
- Save-token mode for cost optimization
- Self-update detection (genius-updater)
- Mode-specific CLAUDE.md and configurations

### Changed
- Complete rewrite from v8 to v9
- Removed all external MCP dependencies (Vibeship, Mind)
- Memory system: external MCPs → file-based JSON + BRIEFING.md

### Removed
- Vibeship dependency
- Mind MCP dependency
- External service requirements
