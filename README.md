# MEP Project Management MVP

Web-based MEP planning software focused on engineering-aware task scheduling and Gantt visualization.

## Stack
- Frontend: React (functional components), Tailwind CSS, D3.js
- Backend: Node.js + Express
- Database: PostgreSQL

## Folder Structure
- `backend`: Express APIs, scheduling/dependency engine, migrations, seed scripts
- `frontend`: React UI with sidebar + filters + D3 Gantt chart

## Backend Features Implemented
- Project setup APIs (`name`, `floors`, `type`)
- Task management APIs (MEP type, floor, dates, duration, status, progress)
- Dependency APIs with circular dependency prevention
- Auto schedule recalculation after dependency or parent task date changes
- Resource assignment endpoints (`role`, `quantity`)
- Progress rollup to project completion
- MEP templates for Electrical, HVAC, Plumbing
- Gantt payload endpoint with critical path task ids

## Frontend Features Implemented
- Left sidebar: project list + task list
- New project creation modal (name, floors, project type)
- Top filter bar: floor and MEP type filters
- SmartDraw-style timeline controls (day/week/month view + zoom)
- Task creation drawer with quantity/productivity inputs
- D3 Gantt chart:
  - timeline bars by start/end
  - row grouping labels via floor + MEP type + task name
  - dependency arrows
  - critical path highlighting
  - time grid and live "today" marker

## Database
Migrations:
- `backend/db/migrations/001_create_projects.sql`
- `backend/db/migrations/002_create_tasks.sql`
- `backend/db/migrations/003_create_dependencies.sql`
- `backend/db/migrations/004_create_resources.sql`

Seed:
- `backend/db/seeds/mep_demo_seed.sql`

## Run Locally
Prerequisites:
- Node.js 20+
- PostgreSQL 14+

1. Copy `.env.example` to `.env` in project root and update `DATABASE_URL` if needed.
2. Install dependencies:
   - `npm install`
3. Run migrations:
   - `npm run migrate --workspace backend`
4. Seed demo data:
   - `npm run seed --workspace backend`
5. Start frontend + backend:
   - `npm run dev`

Backend API base:
- `http://localhost:4000/api`

Frontend:
- `http://localhost:5173`

## Share With Other Users

### Option 1: Share on the same office/home network
1. Start backend and frontend:
   - `npm run dev`
2. Find your computer IP (example: `192.168.1.20`).
3. Open firewall for ports `5173` and `4000`.
4. Other users can open:
   - `http://YOUR_IP:5173`

### Option 2: Deploy online (recommended for real sharing)
1. Deploy backend (Render/Railway/Fly.io) with `DATABASE_URL`.
2. Deploy frontend (Vercel/Netlify) and set:
   - `VITE_API_BASE_URL=https://your-backend-domain/api`
3. Share the frontend URL with your team.

## Notes
- Duration calculation uses `ceil(quantity / productivity_rate)`.
- Critical path uses longest dependency chain by duration.
- Drag-and-drop rescheduling and Excel export are not included in this MVP build.
