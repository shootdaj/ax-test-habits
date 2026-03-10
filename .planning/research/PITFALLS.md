# Pitfalls Research

**Domain:** Habit Tracker Web App
**Researched:** 2026-03-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Vercel Routing Mismatch

**What goes wrong:**
Express routes don't match Vercel's URL rewriting. Routes return 404 in production but work locally.

**Why it happens:**
Developers assume Vercel strips path prefixes (like `/api/habits` becoming `/habits`). Vercel passes the FULL original URL to Express.

**How to avoid:**
- Express routes must use full paths: `/api/habits`, not `/habits`
- Configure vercel.json routes to forward all requests to api/index.js
- Test with `vercel dev` locally before deploying

**Warning signs:**
- Routes work with `node src/app.js` but fail on Vercel
- 404 errors in production only

**Phase to address:** Phase 1 (foundation setup)

---

### Pitfall 2: Streak Calculation Off-by-One Errors

**What goes wrong:**
Streak counts are wrong by 1 day, or streaks break incorrectly on timezone boundaries.

**Why it happens:**
Date comparison using timestamps instead of calendar dates. UTC vs local timezone confusion.

**How to avoid:**
- Compare dates as YYYY-MM-DD strings, not timestamps
- Accept date as string from client, not server-generated
- Test with explicit date sequences including edge cases

**Warning signs:**
- Streak breaks at midnight
- Different streak counts for same data
- Tests pass but manual testing shows wrong numbers

**Phase to address:** Phase 2 (check-ins and streaks)

---

### Pitfall 3: In-Memory Store Shared State Issues

**What goes wrong:**
Store data mutated unexpectedly because objects are passed by reference.

**Why it happens:**
Returning store objects directly instead of copies. Route handlers modify objects in place.

**How to avoid:**
- Return shallow copies from store (spread operator or Object.assign)
- Never mutate store data in route handlers
- Store module controls all mutations

**Warning signs:**
- Test isolation failures
- Data changing unexpectedly between requests

**Phase to address:** Phase 1 (foundation)

---

### Pitfall 4: Static File Serving on Vercel

**What goes wrong:**
Static files (CSS, JS, images) return 404 or are served incorrectly on Vercel serverless.

**Why it happens:**
Express static middleware doesn't work the same way in serverless context. Vercel needs explicit routing.

**How to avoid:**
- Serve static files via the Express app and route ALL requests through api/index.js
- Or configure vercel.json to serve static files separately from the public/ directory
- Test static assets work on `vercel dev`

**Warning signs:**
- Blank page in production (CSS/JS not loading)
- Console errors for missing static resources

**Phase to address:** Phase 1 (foundation) and Phase 3 (frontend)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| In-memory storage | Zero setup | Data loss on restart | Demo/prototype only |
| No auth | Simpler API | No multi-user | Single-user demo |
| Inline CSS | Faster initial dev | Hard to maintain | Never for >5 pages |
| No input validation | Faster dev | Security issues | Never in production |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recalculating all streaks on every request | Slow API responses | Cache streak results, recalculate on checkin change | 100+ habits |
| Loading all checkin history for heat-map | Slow page load | Limit to last 7/30 days | 1+ year of data |
| No pagination on habit list | Slow rendering | Add limit/offset | 50+ habits |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback on check-off | User unsure if action registered | Animate check, update streak instantly |
| Heat-map too small | Can't see individual days | Ensure minimum cell size, add tooltips |
| No confirmation on habit delete | Accidental data loss | Confirm dialog before delete |
| Stats update only on page refresh | Feels broken after check-in | Real-time UI update after API call |

## "Looks Done But Isn't" Checklist

- [ ] **Streak calc:** Test with gaps, weekends (for weekly habits), timezone edges
- [ ] **Heat-map:** Test with no data, partial week, exactly 7 days
- [ ] **Habit deletion:** Verify associated checkins are also cleaned up
- [ ] **API errors:** Return proper error responses, not crashes
- [ ] **Empty states:** Dashboard with zero habits shows helpful message

## Sources

- Vercel serverless deployment documentation
- Express.js production best practices
- Common habit tracker UX patterns

---
*Pitfalls research for: Habit Tracker Web App*
*Researched: 2026-03-10*
