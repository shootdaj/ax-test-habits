# Requirements: Habit Tracker

**Defined:** 2026-03-10
**Core Value:** Users can check off their daily habits and instantly see their streak grow

## v1 Requirements

### Habits

- [ ] **HAB-01**: User can create a habit with name, frequency (daily/weekly), color, and icon emoji
- [ ] **HAB-02**: User can view all habits in a list
- [ ] **HAB-03**: User can edit an existing habit's name, frequency, color, or emoji
- [ ] **HAB-04**: User can delete a habit (with confirmation)
- [ ] **HAB-05**: User can assign a habit to a category/group

### Check-ins

- [ ] **CHK-01**: User can mark a habit as done for today
- [ ] **CHK-02**: User can unmark a habit (undo check-in) for today
- [ ] **CHK-03**: User can mark/unmark a habit for a specific past date
- [ ] **CHK-04**: Check-in state persists within the server session (in-memory)

### Streaks

- [ ] **STR-01**: System calculates current streak (consecutive days completed) for each habit
- [ ] **STR-02**: System calculates longest streak ever for each habit
- [ ] **STR-03**: System calculates completion rate (% of expected days completed) for each habit
- [ ] **STR-04**: Streak counters display with fire emoji on the dashboard

### Stats

- [ ] **STA-01**: User can view weekly stats (habits completed vs expected per day)
- [ ] **STA-02**: User can view monthly stats (overall completion rate trend)
- [ ] **STA-03**: Stats update immediately after check-in/uncheck

### Dashboard

- [ ] **DSH-01**: User sees today's habits as checkable cards on the main dashboard
- [ ] **DSH-02**: Each card shows habit name, emoji, color, and current streak
- [ ] **DSH-03**: Clicking a card toggles the check-in for today
- [ ] **DSH-04**: Dashboard shows a weekly heat-map grid (green = done, gray = missed)
- [ ] **DSH-05**: Dashboard displays progress charts via canvas
- [ ] **DSH-06**: User can filter habits by category via tabs

### Categories

- [ ] **CAT-01**: User can create habit categories/groups
- [ ] **CAT-02**: User can assign habits to categories
- [ ] **CAT-03**: Dashboard tabs filter habits by category
- [ ] **CAT-04**: An "All" tab shows all habits regardless of category

### Frontend

- [ ] **FE-01**: Habit creation form with all fields (name, frequency, color, emoji, category)
- [ ] **FE-02**: Visual and engaging UI with colors and emoji
- [ ] **FE-03**: Responsive layout that works on desktop and mobile browsers
- [ ] **FE-04**: Empty states show helpful messages (no habits yet, no check-ins today)

## v2 Requirements

### Persistence

- **PER-01**: Data persists across server restarts (database integration)
- **PER-02**: Export habits and check-in history as JSON

### Authentication

- **AUTH-01**: User can sign up and log in
- **AUTH-02**: Multiple users can have separate habit lists

### Notifications

- **NOT-01**: Daily reminder notification
- **NOT-02**: Streak milestone celebration (e.g., 7 days, 30 days)

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Single-user demo, no login needed for v1 |
| Database persistence | In-memory only per project requirements |
| Mobile native app | Web-only for v1 |
| Push notifications | Requires auth infrastructure |
| Social features | Single-user focus |
| Dark mode | Defer to v2 |
| Data export/import | Not needed for demo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HAB-01 | Phase 1 | Pending |
| HAB-02 | Phase 1 | Pending |
| HAB-03 | Phase 1 | Pending |
| HAB-04 | Phase 1 | Pending |
| HAB-05 | Phase 4 | Pending |
| CHK-01 | Phase 2 | Pending |
| CHK-02 | Phase 2 | Pending |
| CHK-03 | Phase 2 | Pending |
| CHK-04 | Phase 2 | Pending |
| STR-01 | Phase 2 | Pending |
| STR-02 | Phase 2 | Pending |
| STR-03 | Phase 2 | Pending |
| STR-04 | Phase 3 | Pending |
| STA-01 | Phase 2 | Pending |
| STA-02 | Phase 2 | Pending |
| STA-03 | Phase 3 | Pending |
| DSH-01 | Phase 3 | Pending |
| DSH-02 | Phase 3 | Pending |
| DSH-03 | Phase 3 | Pending |
| DSH-04 | Phase 3 | Pending |
| DSH-05 | Phase 3 | Pending |
| DSH-06 | Phase 4 | Pending |
| CAT-01 | Phase 4 | Pending |
| CAT-02 | Phase 4 | Pending |
| CAT-03 | Phase 4 | Pending |
| CAT-04 | Phase 4 | Pending |
| FE-01 | Phase 3 | Pending |
| FE-02 | Phase 3 | Pending |
| FE-03 | Phase 3 | Pending |
| FE-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
