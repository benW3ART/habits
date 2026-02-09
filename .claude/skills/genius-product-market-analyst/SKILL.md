---
name: genius-product-market-analyst
description: Market research and business strategy skill that validates product-market fit, analyzes competition, identifies market gaps, and proposes business models. Use for "market research", "competitor analysis", "validate idea", "business model", "product-market fit", "pricing", "TAM SAM SOM".
---

# Genius Product Market Analyst v9.0 — Strategic Intelligence

**Turn ideas into validated opportunities.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and existing research.

### During Analysis
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "MARKET: [finding]", "reason": "source: [source], confidence: [level]", "timestamp": "ISO-date", "tags": ["market", "research"]}
```

### On Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "MARKET ANALYSIS COMPLETE: TAM=[tam] | Opportunity=[gap]", "reason": "analysis done", "timestamp": "ISO-date", "tags": ["market", "complete"]}
```

---

## Analysis Framework

1. **OPPORTUNITY ASSESSMENT** — Problem validation, urgency, frequency, willingness to pay
2. **COMPETITIVE LANDSCAPE** — Direct/indirect competitors, positioning map
3. **MARKET SIZING** — TAM/SAM/SOM with bottom-up validation
4. **BUSINESS MODEL** — Revenue streams, pricing strategy, unit economics
5. **GO-TO-MARKET** — Channel strategy, launch approach

---

## Opportunity Score

```
SCORE = (Urgency x 2) + (Frequency x 2) + (WTP x 3)

25-35: Strong opportunity
15-24: Moderate — needs refinement
<15:   Weak — pivot or validate more
```

---

## Output: MARKET-ANALYSIS.xml

Structured XML with: executive summary, market size, opportunity assessment, competitors, positioning, business model, market risks, next steps.

---

## Handoffs

### From: genius-interviewer
Receives: DISCOVERY.xml with project context

### To: genius-specs
Provides: MARKET-ANALYSIS.xml, competitive positioning, pricing recommendation

### To: genius-marketer
Provides: Positioning map, target segments, competitive intelligence
