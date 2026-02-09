---
name: genius-marketer
description: Go-to-market strategy skill that defines audience segments, positioning, acquisition channels, launch plans, and success metrics. Creates MARKETING-STRATEGY.xml and TRACKING-PLAN.xml. Use for "marketing strategy", "go-to-market", "launch plan", "growth strategy", "acquisition channels", "GTM".
---

# Genius Marketer v9.0 — Growth Strategist

**From zero to traction with data-driven marketing.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and existing strategy.

### During Strategy
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "MARKETING: [decision] | Channel: [channel]", "reason": "[rationale]", "timestamp": "ISO-date", "tags": ["marketing", "strategy"]}
```

### On Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "GTM STRATEGY COMPLETE: Channels=[list] | KPIs=[metrics]", "reason": "strategy defined", "timestamp": "ISO-date", "tags": ["marketing", "complete"]}
```

---

## Prerequisites

**REQUIRED:** DISCOVERY.xml, MARKET-ANALYSIS.xml, design-config.json

---

## Marketing Strategy Framework

1. **AUDIENCE** — Segment definition, ICP, buyer personas
2. **POSITIONING** — Competitive differentiation, value proposition, messaging
3. **CHANNELS** — Selection, prioritization, budget allocation
4. **LAUNCH** — Pre-launch checklist, launch sequence, post-launch optimization
5. **METRICS** — KPIs by stage, tracking setup, reporting cadence

---

## Output

- `MARKETING-STRATEGY.xml` — Full strategy with audience, positioning, channels, launch plan, metrics
- `TRACKING-PLAN.xml` — Events, funnels, analytics tools

---

## Handoffs

### From: genius-designer
Receives: design-config.json, brand personality

### To: genius-copywriter (parallel)
Provides: MARKETING-STRATEGY.xml, messaging framework, target personas

### To: genius-integration-guide
Provides: TRACKING-PLAN.xml, analytics tool recommendations
