---
name: genius-security
description: Security audit skill that performs OWASP Top 10 checks, dependency scanning, configuration review, and vulnerability assessment. Produces prioritized fix recommendations. Use for "security audit", "penetration test", "find vulnerabilities", "threat model".
---

# Genius Security v9.0 — The Guardian

**Security is not a feature, it's a requirement.**

## Memory Integration

### On Audit Start
Read `@.genius/memory/BRIEFING.md` for project context and previous security findings.
Check errors.json for known security issues.

### On Finding
Append to `.genius/memory/errors.json`:
```json
{"id": "e-XXX", "error": "VULNERABILITY: [type] [severity] in [path]", "solution": "[remediation]", "timestamp": "ISO-date", "tags": ["security", "vulnerability"]}
```

### On Fix Verified
Append to `.genius/memory/errors.json`:
```json
{"id": "e-XXX", "error": "SECURITY FIXED: [vulnerability_id]", "solution": "[method used]", "timestamp": "ISO-date", "tags": ["security", "fixed"]}
```

---

## Tools

### Local Tools (Always Available)
```bash
npm audit --json 2>&1
grep -rn "eval\|innerHTML" src/ --include="*.ts" --include="*.tsx"
grep -rn "sk_live\|password\s*=" src/ --include="*.ts"
```

### Optional External Tools

You can integrate any third-party security scanner (e.g., Snyk, SonarQube, npm audit) for deeper analysis.

---

## OWASP Top 10 Audit

| # | Vulnerability | What to Check |
|---|---------------|---------------|
| A01 | Broken Access Control | RLS policies, auth checks, middleware |
| A02 | Cryptographic Failures | Secrets exposure, weak crypto |
| A03 | Injection | SQL, NoSQL, XSS, command injection |
| A04 | Insecure Design | Threat model gaps |
| A05 | Security Misconfiguration | Default configs, verbose errors |
| A06 | Vulnerable Components | Outdated dependencies |
| A07 | Auth Failures | Weak passwords, session issues |
| A08 | Data Integrity | Unsigned updates, CI/CD trust |
| A09 | Logging Failures | Missing audit logs |
| A10 | SSRF | Unvalidated URLs |

---

## Critical Patterns to Detect

- **Hardcoded Secrets**: API keys, passwords in code
- **SQL Injection**: String concatenation in queries
- **Missing RLS** (Supabase): Tables without Row Level Security
- **Service Role on Client**: Supabase service_role exposed to browser
- **XSS**: dangerouslySetInnerHTML, unescaped user input
- **Missing Rate Limiting**: Auth endpoints without protection

---

## Output: SECURITY-AUDIT.md

Executive summary, tools used, findings by severity (Critical/High/Medium/Low), AI fix prompts, compliance status (OWASP/SOC2/GDPR), recommendations.

---

## Handoffs

### From genius-qa
Receives: Security-related findings from QA

### To genius-dev
Provides: SECURITY-AUDIT.md with AI fix prompts, priority order

### To genius-deployer
Provides: Security checklist for deployment, pre-deploy gates
