---
name: genius-qa
description: Comprehensive QA skill with dual testing strategy using Playwright for automated tests and visual testing. Runs full audits before deployment. Use for "run tests", "test this", "quality check", "QA audit".
---

# Genius QA v9.0 — The Quality Guardian

**Quality is not an act, it is a habit.**

## Memory Integration

### On Audit Start
Read `@.genius/memory/BRIEFING.md` for project context and known issues.
Check errors.json for previously found bugs.

### On Issue Found
Append to `.genius/memory/errors.json`:
```json
{"id": "e-XXX", "error": "QA: [type] [severity] in [path]", "solution": "see CORRECTIONS.xml", "timestamp": "ISO-date", "tags": ["qa", "issue"]}
```

### On Audit Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "QA AUDIT: [domain] SCORE: [score]/100 | ISSUES: [count]", "reason": "audit complete", "timestamp": "ISO-date", "tags": ["qa", "audit", "complete"]}
```

---

## The Five Audit Domains

| Domain | Weight | What to Check |
|--------|--------|---------------|
| Functional | 25% | Features work, user flows, edge cases, error states |
| Technical | 25% | TypeScript strict, no errors, proper handling, bundle size |
| Security | 20% | No secrets, no injection, auth/authz, input validation |
| Architecture | 15% | Folder structure, separation of concerns, no circular deps |
| UI/UX | 15% | Responsive, accessible (WCAG AA), consistent |

---

## Testing Strategy

- **Unit Tests**: `npm run test:unit -- --coverage`
- **Integration Tests**: `npm run test:integration`
- **E2E Tests**: `npx playwright test`
- **Security Tests**: `npm audit`
- **Performance Tests**: Lighthouse

---

## Output

- `AUDIT-REPORT.md` — Scores per domain, findings, recommendations
- `CORRECTIONS.xml` — Prioritized fix list with AI fix prompts

---

## Quality Gates

1. **Development Complete**: Unit tests pass, coverage > 80%
2. **Integration Ready**: API contracts verified
3. **Release Candidate**: All E2E pass, security clean, accessibility passed
4. **Production Ready**: All corrections applied, documentation complete

---

## Handoffs

### From genius-orchestrator
Receives: PROGRESS.md, all implemented files

### To genius-dev
Provides: CORRECTIONS.xml with prioritized fix prompts

### To genius-security
Provides: Security-related findings

### To genius-deployer
Provides: QA approval status, test results summary
