---
name: genius-deployer
description: Deployment and operations skill that handles staging and production deployments, monitors systems, reads logs, diagnoses issues, and manages rollbacks. Works with Vercel, Railway, and other platforms. Use for "deploy", "go live", "push to production", "ship it".
---

# Genius Deployer v9.0 — Ship It Safely

**Ships code to production with zero downtime. Never deploy on Friday at 5pm.**

## Memory Integration

### On Deploy Start
Read `@.genius/memory/BRIEFING.md` for deployment history and env config.

### On Deploy Success
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "DEPLOYED: [version] to [env]", "reason": "all checks passed", "timestamp": "ISO-date", "tags": ["deployment", "success"]}
```

### On Deploy Failure
Append to `.genius/memory/errors.json`:
```json
{"id": "e-XXX", "error": "DEPLOY FAILED: [version] to [env] — [error]", "solution": "[rollback or fix]", "timestamp": "ISO-date", "tags": ["deployment", "failed"]}
```

---

## Deployment Protocol

### 1. Pre-Deploy Checklist
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Lint clean
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] NOT Friday after 3pm

### 2. Staged Deployment
Build → Deploy to Staging → Smoke Test → Deploy to Production → Monitor (15 min)

### 3. Rollback Procedure
When: Error rate > 5%, critical flow broken, security vulnerability

```bash
# Vercel
vercel rollback
# Railway
railway rollback
```

---

## Platform Commands

### Vercel
`vercel`, `vercel --prod`, `vercel logs`, `vercel rollback`

### Railway
`railway up`, `railway logs`, `railway rollback`

---

## Handoffs

### From genius-qa + genius-security
Receives: QA approval, security clearance

### To genius-debugger (on issue)
Provides: Deployment logs, error messages, environment context
