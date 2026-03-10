# Habit Tracker

## What This Is

A full-stack Habit Tracker web application built with Node.js/Express. Users create habits with daily or weekly frequency, check them off each day, and see their progress through streaks, heat-map grids, and progress charts. The app uses in-memory storage and features an engaging, visual frontend.

## Core Value

Users can check off their daily habits and instantly see their streak grow -- making habit consistency visible and motivating.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] CRUD operations for habits (name, frequency, color, icon emoji)
- [ ] Daily check-ins (mark a habit done for a specific date)
- [ ] Streak calculation (current streak, longest streak, completion rate)
- [ ] Weekly and monthly statistics
- [ ] Habit categories and groups
- [ ] Dashboard with today's habits as checkable cards
- [ ] Streak counters with fire emoji
- [ ] Weekly heat-map grid (green = done, gray = missed)
- [ ] Habit creation form
- [ ] Progress charts using canvas
- [ ] Category tabs for filtering habits

### Out of Scope

- User authentication -- single-user app, no login needed
- Database persistence -- in-memory storage only
- Mobile native app -- web-only
- Push notifications -- not needed for v1
- Social features / sharing -- single-user focus

## Context

- Stack: Node.js with Express for backend, vanilla HTML/CSS/JS for frontend
- Storage: In-memory (data resets on server restart)
- Deployment: Vercel serverless
- The app should feel visual and engaging -- colors, emojis, animations
- All Express routes must use full paths (Vercel does NOT strip path prefixes)

## Constraints

- **Stack**: Node.js/Express -- specified by project requirements
- **Storage**: In-memory only -- no database dependency
- **Deployment**: Vercel serverless -- requires vercel.json + api/index.js entry point
- **Routing**: Express sees full paths on Vercel -- routes must use `/api/...` prefixes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| In-memory storage | Simplicity, no external dependencies, fast for demo | -- Pending |
| Vanilla frontend | No build step needed, works with Vercel serverless | -- Pending |
| Express.js backend | Mature, well-supported, works with Vercel | -- Pending |

---
*Last updated: 2026-03-10 after initialization*
