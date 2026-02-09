---
name: genius-designer
description: Creates complete brand identity and design system with 2-3 visual options in an interactive HTML file. Covers colors, typography, components, and brand personality. REQUIRES USER CHOICE before continuing. Use for "design system", "branding", "colors", "UI design", "visual design", "look and feel", "style guide".
---

# Genius Designer v9.0 — Visual Identity Creator

**Crafting your brand's visual language.**

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for project context and any existing design decisions.

### During Design
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "DESIGN: [choice]", "reason": "[why]", "timestamp": "ISO-date", "tags": ["design", "decision"]}
```

### On Complete
Append to `.genius/memory/decisions.json`:
```json
{"id": "d-XXX", "decision": "DESIGN SYSTEM COMPLETE: Option [X] | Primary: [color] | Font: [font]", "reason": "user selected", "timestamp": "ISO-date", "tags": ["design", "complete"]}
```

---

## Prerequisites

**REQUIRED:** `SPECIFICATIONS.xml` from genius-specs (approved)

---

## Design Process

1. Analyze context (project type, target audience, brand constraints)
2. Generate 2-3 distinct design options
3. Create interactive HTML preview (`DESIGN-SYSTEM.html`)
4. **CHECKPOINT: Wait for user choice**
5. Save selection to `design-config.json`

---

## Design System Components

- Design tokens (colors, spacing, typography, radius)
- Component states (default, hover, focus, active, disabled, loading, error)
- Responsive breakpoints (mobile-first)
- Accessibility (WCAG AA: 4.5:1 contrast, 44x44px touch targets)

---

## CHECKPOINT: User Choice Required

**MANDATORY. Do NOT continue automatically.**

```
DESIGN OPTIONS READY

Open DESIGN-SYSTEM.html in your browser.

Options:
- Option A: [name] — [description]
- Option B: [name] — [description]
- Option C: [name] — [description]

Which design direction do you prefer?
```

---

## After User Chooses

1. Save to `design-config.json` (colors, typography, spacing, radius)
2. Log decision to `.genius/memory/decisions.json`
3. Handoff to genius-marketer

---

## Handoffs

### From: genius-specs
Receives: SPECIFICATIONS.xml (approved), screen definitions

### To: genius-marketer
Provides: DESIGN-SYSTEM.html, design-config.json, brand personality

### To: genius-dev (later)
Provides: design-config.json, Tailwind configuration
