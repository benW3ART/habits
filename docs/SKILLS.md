# Genius Team Skills Reference

## Overview

Genius Team v9.0 consists of 21 core skills + 1 updater skill, organized into phases:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 1: IDEATION                           │
├─────────────────────────────────────────────────────────────────┤
│  genius-interviewer → genius-product-market-analyst             │
│            ↓                                                    │
│  genius-specs  ─────────────────→ [CHECKPOINT: Approve specs]   │
│            ↓                                                    │
│  genius-designer ───────────────→ [CHECKPOINT: Choose design]   │
│            ↓                                                    │
│  genius-marketer + genius-copywriter                            │
│            ↓                                                    │
│  genius-integration-guide                                       │
│            ↓                                                    │
│  genius-architect ──────────────→ [CHECKPOINT: Approve arch]    │
├─────────────────────────────────────────────────────────────────┤
│                     PHASE 2: EXECUTION (Agent Teams)            │
├─────────────────────────────────────────────────────────────────┤
│  genius-orchestrator (Lead)                                     │
│      ├── genius-dev (teammate)                                  │
│      ├── genius-qa-micro (teammate, MANDATORY after every task) │
│      ├── genius-debugger (teammate)                             │
│      └── genius-reviewer (teammate)                             │
├─────────────────────────────────────────────────────────────────┤
│                     PHASE 3: VALIDATION                         │
├─────────────────────────────────────────────────────────────────┤
│  genius-qa → genius-security → genius-deployer                  │
├─────────────────────────────────────────────────────────────────┤
│                     SUPPORT SKILLS                              │
├─────────────────────────────────────────────────────────────────┤
│  genius-team (router) | genius-memory | genius-onboarding       │
│  genius-test-assistant | genius-team-optimizer | genius-updater  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Workflow Skills

### genius-team — Intelligent Router
Detects user intent, routes to appropriate skill. Entry point for all interactions.

### genius-interviewer — Requirements Discovery
ONE question at a time. Output: `DISCOVERY.xml`

### genius-product-market-analyst — Market Validation
TAM/SAM/SOM, competitors, pricing. Output: `MARKET-ANALYSIS.xml`

### genius-specs — Formal Specifications
User stories, use cases, business rules. **CHECKPOINT: User approval required.** Output: `SPECIFICATIONS.xml`

### genius-designer — Visual Identity
2-3 design options. **CHECKPOINT: User must choose.** Output: `DESIGN-SYSTEM.html`, `design-config.json`

### genius-marketer — Go-to-Market Strategy
Audience, positioning, channels, launch plan. Output: `MARKETING-STRATEGY.xml`, `TRACKING-PLAN.xml`

### genius-copywriter — Marketing Copy
Landing page, emails, UI text, A/B variants. Output: `COPY.md`

### genius-integration-guide — Service Setup
Step-by-step external service configuration. Output: `INTEGRATIONS.md`, `.env.example`

### genius-architect — Technical Planning
Architecture decisions, task decomposition. **CHECKPOINT: User approval required.** Output: `ARCHITECTURE.md`, `.claude/plan.md`

---

## Execution Skills (Agent Teams)

### genius-orchestrator — Lead Coordinator
Delegates all work to teammates. Never writes code directly. Enforces mandatory QA loop. Uses Agent Teams.

### genius-dev — Code Implementation (Teammate)
Implements tasks in forked context. Reports PASS/FAIL.

### genius-qa-micro — Quick Validation (Teammate, MANDATORY)
30-second quality check after every task. Reports QA PASS/FAIL.

### genius-debugger — Error Fixing (Teammate)
Analyzes and fixes errors. Up to 3 retries.

### genius-reviewer — Code Review (Teammate, Read-Only)
Scores code quality. Never modifies files.

---

## Validation Skills

### genius-qa — Full Quality Audit
5-domain audit (functional, technical, security, architecture, UI/UX). Output: `AUDIT-REPORT.md`, `CORRECTIONS.xml`

### genius-security — Security Audit
OWASP Top 10, dependency scanning, secrets detection. Output: `SECURITY-AUDIT.md`

### genius-deployer — Deployment
Staged deployment with pre-deploy checks and rollback plan.

---

## Support Skills

### genius-memory — Knowledge Management
File-based memory: decisions.json, patterns.json, errors.json, BRIEFING.md

### genius-onboarding — First-Time Setup
5 questions max, creates user-profile.json

### genius-test-assistant — Manual Testing Companion
Real-time error monitoring during manual testing

### genius-team-optimizer — Self-Improvement
Analyzes performance, proposes skill updates

### genius-updater — Claude Code Version Tracking
Detects Claude Code updates, proposes repo modifications

---

## Memory Integration (All Skills)

All skills use the same pattern:
1. **Session start**: Read `@.genius/memory/BRIEFING.md`
2. **On decisions**: Append to `.genius/memory/decisions.json`
3. **On errors**: Append to `.genius/memory/errors.json`
4. **On patterns**: Append to `.genius/memory/patterns.json`
