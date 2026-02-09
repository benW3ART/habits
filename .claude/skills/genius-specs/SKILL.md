---
name: genius-specs
description: Transforms discovery findings into formal specifications with user stories, use cases, business rules, and acceptance criteria. REQUIRES USER APPROVAL before continuing to design phase. Use for "specs", "specifications", "requirements", "user stories", "acceptance criteria", "write specs".
---

# Genius Specs v9.0 — Requirements Architect

**Transforming discoveries into crystal-clear specifications.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and past decisions.

### During Specification
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "SPEC: [story_id] [title] Priority: [priority]", "reason": "derived from discovery", "timestamp": "ISO-date", "tags": ["specification", "user-story"]}
```

### On Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "SPECIFICATIONS COMPLETE: [count] stories, [use_cases] use cases", "reason": "awaiting user approval", "timestamp": "ISO-date", "tags": ["specification", "checkpoint"]}
```

---

## Prerequisites

**REQUIRED before starting:**
- `DISCOVERY.xml` from genius-interviewer
- `MARKET-ANALYSIS.xml` from genius-product-market-analyst (optional)

---

## Specification Process

1. Load Discovery
2. Extract User Stories (As a... I want... So that...)
3. Elaborate Use Cases (preconditions, flows, postconditions)
4. Document Business Rules
5. Define NFRs (performance, security, accessibility)

---

## Output: SPECIFICATIONS.xml

Structured XML with:
- User stories with acceptance criteria (Given/When/Then)
- Use cases with main and alternative flows
- Business rules
- Non-functional requirements
- Data model
- API endpoints
- Screen definitions
- Glossary

---

## Quality Checklist

- [ ] Every story has at least 2 acceptance criteria
- [ ] All criteria are testable (Given/When/Then)
- [ ] Business rules are explicit and unambiguous
- [ ] No implementation details in specs (WHAT, not HOW)
- [ ] NFRs have measurable targets
- [ ] Data model covers all entities
- [ ] API endpoints defined for all actions

---

## CHECKPOINT: User Approval Required

**MANDATORY. Do NOT continue automatically.**

After generating SPECIFICATIONS.xml:
```
SPECIFICATIONS COMPLETE

Summary: [X] stories, [Y] use cases, [Z] business rules

Ready to move to the design phase?
--> "yes" or "approved" to proceed
--> "change [aspect]" to revise
```

---

## Handoffs

### From: genius-interviewer / genius-product-market-analyst
Receives: DISCOVERY.xml, MARKET-ANALYSIS.xml

### To: genius-designer (after approval)
Provides: SPECIFICATIONS.xml, screen definitions, component list

### To: genius-architect
Provides: SPECIFICATIONS.xml, data model, API endpoints, NFRs
