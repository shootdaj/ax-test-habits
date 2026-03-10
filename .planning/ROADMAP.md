# Roadmap: Habit Tracker

**Created:** 2026-03-10
**Phases:** 4
**Requirements covered:** 28/28

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Habit API | Express server with habit CRUD and Vercel deployment | HAB-01, HAB-02, HAB-03, HAB-04 | 4 |
| 2 | Check-ins, Streaks & Stats | Complete check-in system with streak calculation and statistics | CHK-01, CHK-02, CHK-03, CHK-04, STR-01, STR-02, STR-03, STA-01, STA-02 | 5 |
| 3 | Frontend Dashboard | Interactive dashboard with heat-map, charts, and habit forms | STR-04, STA-03, DSH-01, DSH-02, DSH-03, DSH-04, DSH-05, FE-01, FE-02, FE-03, FE-04 | 5 |
| 4 | Categories & Polish | Category system, filtering, and final polish | HAB-05, DSH-06, CAT-01, CAT-02, CAT-03, CAT-04 | 4 |

---

## Phase 1: Foundation & Habit API

**Goal:** Set up Express server with in-memory store, habit CRUD API, and Vercel deployment configuration.

**Requirements:**
- HAB-01: Create habit with name, frequency, color, emoji
- HAB-02: View all habits
- HAB-03: Edit habit
- HAB-04: Delete habit

**Success Criteria:**
1. Express server starts and responds to requests
2. POST /api/habits creates a new habit and returns it with an ID
3. GET /api/habits returns all habits
4. PUT /api/habits/:id updates a habit and DELETE /api/habits/:id removes it
5. vercel.json and api/index.js are configured correctly for Vercel deployment

**Dependencies:** None (first phase)

---

## Phase 2: Check-ins, Streaks & Stats

**Goal:** Implement daily check-in system, streak calculation engine, and weekly/monthly statistics.

**Requirements:**
- CHK-01: Mark habit done for today
- CHK-02: Unmark habit for today
- CHK-03: Mark/unmark for past date
- CHK-04: Check-in state persists in session
- STR-01: Current streak calculation
- STR-02: Longest streak calculation
- STR-03: Completion rate calculation
- STA-01: Weekly stats
- STA-02: Monthly stats

**Success Criteria:**
1. POST /api/checkins toggles a check-in for a habit on a specific date
2. GET /api/habits/:id/streaks returns current streak, longest streak, and completion rate
3. Streak calculation correctly handles gaps, weekends (for weekly habits), and edge cases
4. GET /api/stats/weekly and /api/stats/monthly return aggregated statistics
5. All calculations update immediately after a check-in change

**Dependencies:** Phase 1 (habits must exist)

---

## Phase 3: Frontend Dashboard

**Goal:** Build the complete frontend with interactive dashboard, heat-map grid, progress charts, and habit creation form.

**Requirements:**
- STR-04: Streak counters with fire emoji
- STA-03: Stats update after check-in
- DSH-01: Today's habits as checkable cards
- DSH-02: Cards show name, emoji, color, streak
- DSH-03: Click card to toggle check-in
- DSH-04: Weekly heat-map grid
- DSH-05: Progress charts (canvas)
- FE-01: Habit creation form
- FE-02: Visual/engaging UI
- FE-03: Responsive layout
- FE-04: Empty states

**Success Criteria:**
1. Dashboard renders today's habits as clickable, color-coded cards with emoji and streak count
2. Clicking a card toggles check-in status and updates streak counter without page reload
3. Weekly heat-map grid displays 7 columns with green/gray cells based on check-in data
4. Canvas-based progress chart shows completion rate trend over time
5. Habit creation form works and new habits appear on dashboard immediately

**Dependencies:** Phase 2 (check-ins and streaks API must be working)

---

## Phase 4: Categories & Polish

**Goal:** Add habit category/group system with dashboard tab filtering, and polish UX edge cases.

**Requirements:**
- HAB-05: Assign habit to category
- DSH-06: Filter by category tabs
- CAT-01: Create categories
- CAT-02: Assign habits to categories
- CAT-03: Dashboard tabs filter by category
- CAT-04: "All" tab shows all habits

**Success Criteria:**
1. CRUD API for categories works (create, list, update, delete)
2. Habits can be assigned to a category during creation or editing
3. Dashboard shows category tabs that filter the visible habits
4. "All" tab is selected by default and shows every habit

**Dependencies:** Phase 3 (dashboard must exist for tabs)

---

## Requirement Coverage

All 28 v1 requirements are mapped to phases. No unmapped requirements.

---
*Roadmap created: 2026-03-10*
