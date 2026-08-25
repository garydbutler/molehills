# Molehill — Web

Next.js (App Router) marketing site for Squirrelz, ready to deploy to Vercel.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Vercel Postgres (Neon-backed) via `@vercel/postgres`
- API routes: `/api/health` (DB check), `/api/signup` (early-access emails)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in POSTGRES_URL
npm run dev                  # http://localhost:3000
```

Apply the starter schema:

```bash
npm run db:push
```

## Deploying

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo with **root directory** set to `web`.
3. Add a database: Vercel dashboard → your project → **Storage** → create a Postgres (Neon) database and connect it. This injects `POSTGRES_URL` into deployments automatically. (`@vercel/postgres` shows a deprecation notice because Vercel now provisions Postgres through Neon; the client still works against it unchanged.)
4. Run `npx vercel env pull .env.local` locally to get the connection string for local dev, then `npm run db:push`.

## Where the landing design goes

The placeholder page lives in `src/app/page.tsx`, with colors defined as CSS variables in `src/app/globals.css`. When the design arrives, restyle the tokens and replace the section markup — the signup API at `src/app/api/signup/route.ts` is already wired to store emails in the `early_access_signups` table.
