-- Starter schema for Inchmeal.
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

-- ---------------------------------------------------------------------------
-- Accounts and metering.
--
-- The server is the referee for money and nothing else. Projects, steps,
-- photos and progress stay on the device; what lives here is who you are,
-- what you have spent, and whether you are paying.
-- ---------------------------------------------------------------------------

-- One row per account. `sub` is the OAuth subject from the mobile JWT and is
-- the only identity the API trusts. RevenueCat keys entitlements off the same
-- value, so the webhook can find the row without a second mapping table.
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sub         TEXT NOT NULL UNIQUE,
  email       TEXT,
  provider    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Set only by the RevenueCat webhook, never by the client. NULL expiry with
  -- is_pro true would be a bug, so both move together.
  is_pro          BOOLEAN NOT NULL DEFAULT false,
  pro_expires_at  TIMESTAMPTZ,
  rc_updated_at   TIMESTAMPTZ
);

-- One row per successful plan generation. Both tiers are derived from this
-- single table: free is a lifetime COUNT, paid is a COUNT inside a rolling
-- 30-day window. No counters to drift out of sync with reality.
CREATE TABLE IF NOT EXISTS plan_generations (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The rolling-window query filters by user and date on every plan request.
CREATE INDEX IF NOT EXISTS plan_generations_user_created_idx
  ON plan_generations (user_id, created_at DESC);

-- Recapture is a vision call per look, so it needs its own ceiling. Counted
-- per local day the client reports, matching what the app shows the user.
CREATE TABLE IF NOT EXISTS recapture_calls (
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         DATE NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- Image generation is the priciest call. Retries are bounded per project so a
-- failing generate loop cannot become an unmetered tap.
CREATE TABLE IF NOT EXISTS end_state_attempts (
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id  TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, project_id)
);
