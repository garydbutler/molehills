# Inchmeal

Big things, finished gently. An app for people with ADHD or anyone overwhelmed by big tasks: photograph a space or describe a goal, see the end state, and get small steps to get there — calmly.

## Layout

| Folder  | What it is |
|---------|------------|
| `web/`    | Next.js marketing site — deploys to Vercel with Vercel Postgres (Neon). Hosts the landing page design and the early-access signup API. See `web/README.md`. |
| `mobile/` | Expo app (SDK 57) with expo-router, TypeScript, and typed routes. Screens: home (`src/app/index.tsx`) and capture (`src/app/capture.tsx`). |

The landing page in `web/` is the full Inchmeal design (ported from `web/references/tend-landing.html`). The calm sage/ivory palette is defined once as CSS variables in `web/src/app/globals.css` and mirrored in `mobile/src/theme/colors.ts`.

## Running locally

```bash
# Web
cd web && npm install && npm run dev

# Mobile
cd mobile && npm install && npm start   # scan QR with Expo Go
```

## Deploying the web site

1. In Vercel: **Add New → Project → Import** this repo.
2. Set **Root Directory** to `web`.
3. **Storage → Create Database → Postgres** and connect it to the project — this injects `POSTGRES_URL` into deployments automatically.
4. Locally: `npx vercel link`, then `npx vercel env pull .env.local`, then `npm run db:push` from `web/` to create the schema.

Every push to `main` auto-deploys the site.

## Next steps

- Build out the capture flow in `mobile/src/app/capture.tsx` (camera via `expo-image-picker`, task list, end-state view).
- Wire mobile to a shared backend once the app API exists (today only the waitlist API is live).
