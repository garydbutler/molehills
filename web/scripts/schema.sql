-- Starter schema for Molehill.
-- Apply with: npm run db:push   (from web/, with POSTGRES_URL set)
-- All statements are idempotent.

CREATE TABLE IF NOT EXISTS early_access_signups (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
