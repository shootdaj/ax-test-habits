# Architecture Research

**Domain:** Habit Tracker Web App
**Researched:** 2026-03-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Static HTML/CSS/JS)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Dashboard│  │ HeatMap │  │ Charts  │  │  Forms  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                          │ fetch() API calls                │
├──────────────────────────┼──────────────────────────────────┤
│                     Express API Server                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Habits   │  │ Checkins │  │ Streaks  │  │  Stats   │     │
│  │ Routes   │  │ Routes   │  │ Service  │  │ Service  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       └────────────┬─┴────────────┴──────────────┘           │
├────────────────────┼────────────────────────────────────────┤
│                In-Memory Store                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Habits   │  │ Checkins │  │Categories│                   │
│  │  Map     │  │   Map    │  │   Map    │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Dashboard | Today's habits, check-off UI | HTML cards with fetch API |
| HeatMap | Weekly grid visualization | Canvas or CSS grid |
| Charts | Progress over time | Canvas-based charts |
| Habits Routes | CRUD endpoints | Express router |
| Checkins Routes | Mark done/undone per date | Express router |
| Streaks Service | Calculate current/longest streaks | Pure function on checkin data |
| Stats Service | Weekly/monthly aggregation | Pure function on checkin data |
| In-Memory Store | Data persistence (runtime only) | JavaScript Map objects |

## Recommended Project Structure

```
src/
├── app.js              # Express app setup (middleware, routes)
├── routes/
│   ├── habits.js       # /api/habits CRUD
│   ├── checkins.js     # /api/checkins mark/unmark
│   └── stats.js        # /api/stats endpoints
├── services/
│   ├── streaks.js      # Streak calculation logic
│   └── stats.js        # Aggregation logic
├── store/
│   └── index.js        # In-memory data store
└── public/
    ├── index.html       # Main page
    ├── css/
    │   └── styles.css   # All styles
    └── js/
        ├── app.js       # Main frontend logic
        ├── dashboard.js # Dashboard rendering
        ├── heatmap.js   # Heat-map component
        └── charts.js    # Progress charts
api/
└── index.js            # Vercel serverless entry point
```

### Structure Rationale

- **routes/**: Separation of concerns by resource
- **services/**: Business logic isolated from HTTP layer
- **store/**: Single source of truth, easily swappable for DB later
- **public/**: Static files served by Express
- **api/**: Vercel serverless adapter

## Architectural Patterns

### Pattern 1: Service Layer

**What:** Business logic in service modules, routes only handle HTTP
**When to use:** Always -- keeps routes thin and logic testable
**Trade-offs:** Slightly more files, but much better testability

### Pattern 2: In-Memory Store with Map

**What:** JavaScript Map objects as data store
**When to use:** Demo apps, prototypes, apps without persistence needs
**Trade-offs:** Data lost on restart, but zero setup/dependencies

### Pattern 3: Static Frontend with API

**What:** Serve static HTML/CSS/JS, interact via fetch() to API
**When to use:** Simple apps without complex state management
**Trade-offs:** No component framework, but no build step needed

## Data Flow

### Request Flow

```
[User clicks "Done"]
    ↓
[fetch POST /api/checkins]
    ↓
[Checkins Router] → [Store: add checkin] → [Streaks Service: recalculate]
    ↓
[200 OK with updated streak data]
    ↓
[Dashboard: update streak counter + heat-map]
```

### Key Data Flows

1. **Check-in flow:** User toggles habit → POST to API → store updated → streak recalculated → UI refreshed
2. **Dashboard load:** Page load → GET /api/habits → GET /api/stats → render cards + heatmap + charts
3. **Habit creation:** Form submit → POST /api/habits → store updated → redirect to dashboard

## Anti-Patterns

### Anti-Pattern 1: Fat Routes

**What people do:** Put business logic directly in route handlers
**Why it's wrong:** Untestable, hard to reuse logic
**Do this instead:** Extract to service modules

### Anti-Pattern 2: Frontend Streak Calculation

**What people do:** Calculate streaks in the browser
**Why it's wrong:** Inconsistent results, duplicated logic
**Do this instead:** Server-side calculation, send results via API

## Sources

- Express.js best practices documentation
- Vercel serverless deployment patterns
- MVC architectural pattern references

---
*Architecture research for: Habit Tracker Web App*
*Researched: 2026-03-10*
