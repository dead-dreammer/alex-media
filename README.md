Test setup

To run tests locally on Windows PowerShell:

1. Install dependencies:

```powershell
npm install
```

2. Run tests:

```powershell
npm test
```

Notes:
- Tests use Jest + jsdom. They validate a small utility set (`test-utils.js`).
- If you prefer tests integrated with existing browser files, we can refactor and export more helpers from `site.js` and `script.js`.

Content admin (Neon Postgres)

Site content (Services, Work, Pricing, Reviews) lives in a Neon Postgres
database. The admin UI edits it through serverless API routes; changes are
live immediately (no rebuild). Visitors can also submit reviews, which stay
pending until approved in the admin.

Environment variables (set in Vercel → Settings → Environment Variables):

- `DATABASE_URL` — Neon connection string (the pooled connection is fine).
- `ADMIN_SECRET` — a random string protecting the admin write endpoints and
  the `/admin.html` page. Paste it into the Admin UI to load/save.

API routes:
- `GET  /api/content` — public; returns services, work, pricing, and approved reviews. The site reads this.
- `POST /api/content` — admin (Bearer secret); replaces one section's items.
- `POST /api/reviews` — public submit (saved as pending); admin submit is auto-approved.
- `GET  /api/reviews?all=1` — admin; lists all reviews incl. pending.
- `PATCH /api/reviews` — admin; `{ id, approved }` to publish/unpublish.
- `DELETE /api/reviews?id=` — admin; removes a review.
- `POST /api/init` — admin; one-time: creates the tables and seeds them from `data/content.json`.

Setup:

1. Create a Neon project (https://neon.tech), copy its connection string.
2. In Vercel, add `DATABASE_URL` and `ADMIN_SECRET` env vars, then deploy.
3. Initialize the database once (creates tables + seeds current content):

```powershell
curl -X POST https://your-deployment/api/init -H "Authorization: Bearer <ADMIN_SECRET>"
```

4. Visit `/admin.html`, paste the `ADMIN_SECRET`, and edit. The page itself is
   protected by HTTP Basic auth (see `middleware.js`) — leave the username
   blank and use the secret as the password.

Local testing with the Vercel CLI:

```powershell
npm install
npm i -g vercel
# put DATABASE_URL and ADMIN_SECRET in .env.local (gitignored), then:
vercel dev
```

Notes:
- `data/content.json` is now only the seed used by `/api/init`. The live site
  reads from the database via `/api/content`.
- Reviews are protected from spam by a honeypot field plus the moderation
  queue — nothing appears publicly until you approve it.

Security notes:
- Keep `DATABASE_URL` and `ADMIN_SECRET` secret. They live only in env vars,
  never in client code.
