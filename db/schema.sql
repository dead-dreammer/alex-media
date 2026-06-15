-- Alex Media — content schema for Neon Postgres.
-- You normally don't need to run this by hand: POST /api/init (with the
-- admin secret) creates these tables and seeds them. Kept here for reference.

-- services / work / pricing: each item is one JSONB row, ordered by position.
CREATE TABLE IF NOT EXISTS content (
  id        SERIAL PRIMARY KEY,
  section   TEXT NOT NULL,            -- 'services' | 'work' | 'pricing'
  position  INT  NOT NULL DEFAULT 0,
  data      JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS content_section_pos_idx ON content (section, position);

-- reviews: row-level so visitor submissions can sit pending until approved.
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  business   TEXT,
  text       TEXT NOT NULL,
  rating     INT  NOT NULL DEFAULT 5,
  color      TEXT NOT NULL DEFAULT 'blue',
  approved   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews (approved, created_at);
