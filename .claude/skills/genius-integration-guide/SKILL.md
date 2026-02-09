---
name: genius-integration-guide
description: Guides user step-by-step through external service setup based on project phase (MVP/Beta/Production). Collects environment variables, validates configurations, creates .env files. Use for "setup integrations", "configure services", "env setup", "environment variables", "connect to", "add API".
---

# Genius Integration Guide v9.0 — Service Setup Wizard

**Making external service integration painless.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and what's already configured.

### During Setup
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "INTEGRATION: [service] configured | Phase: [phase]", "reason": "project requirement", "timestamp": "ISO-date", "tags": ["integration", "config"]}
```

### On Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "INTEGRATIONS COMPLETE: [count] services | .env created", "reason": "[phase] setup done", "timestamp": "ISO-date", "tags": ["integration", "complete"]}
```

---

## Integration Categories

- **AUTH**: Supabase, Auth0, Clerk, NextAuth
- **PAYMENTS**: Stripe, Lemon Squeezy, PayPal
- **EMAIL**: Resend, SendGrid, Postmark
- **STORAGE**: Supabase Storage, S3, Cloudflare R2
- **ANALYTICS**: PostHog, Mixpanel, Plausible
- **AI**: OpenAI, Anthropic, Replicate
- **DEPLOY**: Vercel, Railway, Netlify
- **MONITOR**: Sentry, LogRocket

---

## Phase-Based Setup

- **MVP**: Essential only (Supabase, Vercel)
- **Beta**: Add monitoring (Sentry, PostHog)
- **Production**: Full stack (Stripe, Upstash)

---

## Output

- `INTEGRATIONS.md` — Configured services, status, credentials summary
- `.env.example` — Template for team (committed)
- `.env.local` — Actual values (gitignored)

---

## Security Reminders

1. **Never commit secrets** — Verify .gitignore
2. **Use correct prefix** — `NEXT_PUBLIC_` = browser-visible only
3. **Rotate compromised keys** immediately

---

## Handoffs

### From: genius-marketer + genius-copywriter
Receives: TRACKING-PLAN.xml, project requirements

### To: genius-architect
Provides: INTEGRATIONS.md, .env.example, configured services list
