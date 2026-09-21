# FORM

FORM is a mobile-first workout tracking application for structured training, persisted workout sessions, and measurable progress.

## Stack

- Next.js 16 App Router and TypeScript
- Prisma 6 with SQLite for local development and PostgreSQL-compatible schema
- Signed HTTP-only session cookies with `jose`
- `bcryptjs` password hashing and Zod server-side validation
- Tailwind CSS 4 plus a focused CSS design system

## Local setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Demo accounts:

- User: `alex@form.training` / `form-demo-password`
- Admin: `admin@form.training` / `form-demo-password`

Change these values before using a shared environment.

## Commands

```bash
npm run dev          # development server
npm run lint         # ESLint
npm run build        # production build
npm run db:generate  # generate Prisma client
npm run db:migrate   # create/apply migration
npm run db:seed      # development seed data
```

## Environment

`.env.example` documents `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL`. Never expose the database URL or session secret to the browser. Use a managed PostgreSQL database and a unique high-entropy session secret in production.

## Verified flows

The current application includes responsive public/app shells, protected routes, registration/login/session APIs, onboarding persistence, seeded workout and exercise browsing, query-backed exercise search/type filters, rich exercise details with credited Unsplash media and validated YouTube tutorial embedding, written instruction fallbacks, workout session creation, ownership-checked set recording, a rest timer, active-session restore, a completion summary, persisted heaviest-weight personal records, workout history, progress calculations with empty states, and server-side admin authorization with exercise/program creation endpoints.

### Exercise media

Exercise media is stored relationally in `ExerciseMedia` with type, source, attribution URL, thumbnail, ordering, and primary-media fields. The current embed validator accepts standard YouTube watch URLs and converts them to `youtube-nocookie.com` embeds. Unsupported or unavailable media falls back to written instructions; arbitrary iframe URLs are never rendered.

## Production backlog

Reminder delivery requires a notification provider and scheduler; preferences are modeled but browser notifications are not claimed as active. Remaining product work includes full admin media edit/delete/reorder UI, richer multi-filter controls, automatic records beyond heaviest weight, automated unit/integration/E2E tests, and visual browser checks across target devices.
