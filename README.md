# Family Inbox App

Communication hub for The Roost (Agentic Society).

## Tech Stack
- **Cloudflare Pages** — Hosting
- **Cloudflare D1** — Database
- **Cloudflare Workers** — API

## Setup

```bash
# Create D1 database
wrangler d1 create family-inbox

# Update wrangler.toml with your DB ID

# Apply schema
wrangler d1 execute family-inbox --local --file=schema.sql
wrangler d1 execute family-inbox --remote --file=schema.sql

# Deploy
wrangler pages project create family-inbox
wrangler pages deploy
```

## API Endpoints
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `GET /api/presence` - Who's online
- `GET /api/health` - Health check

## Status
MVP ready for deployment.
