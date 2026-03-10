# Project Research Summary

**Project:** Habit Tracker
**Domain:** Habit Tracker Web App
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

The Habit Tracker is a full-stack web application built with Node.js/Express on the backend and vanilla HTML/CSS/JS on the frontend. This is a well-understood domain with established UX patterns from apps like Habitica, Streaks, and Loop Habit Tracker. The recommended approach emphasizes simplicity: Express for API, in-memory storage, and a static frontend with no build step.

The main risks are Vercel routing mismatches (Express seeing full paths), streak calculation date bugs, and static file serving in serverless context. All are preventable with correct setup in Phase 1.

## Key Findings

### Recommended Stack

Express 4.x on Node.js 20 LTS with vanilla HTML/CSS/JS frontend. No database -- in-memory Maps for storage. Vitest for testing. Deployed to Vercel serverless via api/index.js entry point.

**Core technologies:**
- Express 4.x: HTTP framework -- mature, Vercel-compatible
- Node.js 20 LTS: Runtime -- stable, long-term support
- Vanilla HTML/CSS/JS: Frontend -- no build step, simple deployment

### Expected Features

**Must have (table stakes):**
- Habit CRUD with name, frequency, color, emoji
- Daily check-ins (mark done/undone)
- Current streak display
- Today's dashboard with checkable cards

**Should have (competitive):**
- Weekly heat-map grid
- Progress charts (canvas)
- Category tabs
- Longest streak + completion rate

**Defer (v2+):**
- User authentication
- Database persistence
- Push notifications

### Architecture Approach

Three-layer architecture: static frontend making fetch() calls to Express API routes, with business logic in service modules and data in an in-memory store. Routes handle HTTP, services handle logic, store handles data.

**Major components:**
1. Express API routes -- habits, checkins, stats
2. Service layer -- streak calculation, stats aggregation
3. In-memory store -- Map-based data persistence
4. Static frontend -- dashboard, heatmap, charts, forms

### Critical Pitfalls

1. **Vercel routing** -- Express must use full paths (/api/habits, not /habits)
2. **Streak date bugs** -- Compare YYYY-MM-DD strings, not timestamps
3. **Store mutation** -- Return copies from store, never mutate directly
4. **Static files on Vercel** -- Route all requests through api/index.js

## Implications for Roadmap

### Phase 1: Foundation & API
**Rationale:** Backend must exist before frontend can call it
**Delivers:** Express server, in-memory store, habit CRUD API, Vercel config
**Addresses:** Table stakes (CRUD), Vercel routing pitfall
**Avoids:** Routing mismatches, store mutation bugs

### Phase 2: Check-ins & Streaks
**Rationale:** Check-ins depend on habits existing; streaks depend on check-ins
**Delivers:** Check-in endpoints, streak calculation, stats aggregation
**Addresses:** Core engagement features, streak accuracy
**Avoids:** Date calculation bugs

### Phase 3: Frontend Dashboard
**Rationale:** API must be stable before building UI against it
**Delivers:** Dashboard with checkable cards, heat-map, charts, forms
**Addresses:** All frontend features, visual engagement
**Avoids:** Static file serving issues

### Phase 4: Polish & Categories
**Rationale:** Core features must work before adding organization/polish
**Delivers:** Category system, UI polish, edge cases, empty states
**Addresses:** Category tabs, UX polish items

### Phase Ordering Rationale

- Backend before frontend (API must be stable for frontend to call)
- CRUD before streaks (streaks depend on check-in data)
- Core features before polish (get it working, then make it good)
- Each phase has clear deliverables and can be independently tested

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Standard Express/Node.js, well-documented |
| Features | HIGH | Well-understood domain with established patterns |
| Architecture | HIGH | Simple three-layer architecture |
| Pitfalls | HIGH | Well-known Vercel/Express gotchas |

**Overall confidence:** HIGH

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
