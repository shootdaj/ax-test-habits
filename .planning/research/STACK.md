# Stack Research

**Domain:** Habit Tracker Web App
**Researched:** 2026-03-10
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 20 LTS | Runtime | Stable LTS, Vercel-compatible |
| Express | 4.x | HTTP framework | Mature, well-documented, Vercel serverless support |
| Vanilla HTML/CSS/JS | ES2022 | Frontend | No build step, works with Vercel, simple deployment |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cors | 2.x | CORS middleware | API cross-origin requests |
| uuid | 9.x | ID generation | Unique habit/checkin IDs |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| vitest | Unit/integration testing | Fast, modern, Node.js native |
| nodemon | Dev server auto-restart | Development only |
| eslint | Code linting | Consistent code style |

## Installation

```bash
# Core
npm install express cors uuid

# Dev dependencies
npm install -D vitest eslint nodemon
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Express | Fastify | Higher performance needs |
| Vanilla JS | React/Vue | Complex SPA with state management |
| In-memory | SQLite | Need persistence across restarts |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MongoDB/PostgreSQL | Overkill for in-memory demo app | In-memory Map/Array |
| React/Next.js | Adds build complexity, not needed | Vanilla HTML/CSS/JS |
| TypeScript | Adds build step complexity for small project | Plain JavaScript |

## Sources

- Express.js official docs
- Vercel Node.js serverless documentation
- Node.js 20 LTS release notes

---
*Stack research for: Habit Tracker Web App*
*Researched: 2026-03-10*
