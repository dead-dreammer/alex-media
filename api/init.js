// POST /api/init  (Bearer admin secret)
// One-time setup: creates the tables and, if they're empty, seeds them from
// data/content.json. Safe to call again — it won't duplicate seeded data.
const { sql, isAuthed } = require('../lib/db');
const seed = require('../data/content.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = sql();

    await db`CREATE TABLE IF NOT EXISTS content (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      position INT NOT NULL DEFAULT 0,
      data JSONB NOT NULL
    )`;
    await db`CREATE INDEX IF NOT EXISTS content_section_pos_idx ON content (section, position)`;
    await db`CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      business TEXT,
      text TEXT NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      color TEXT NOT NULL DEFAULT 'blue',
      approved BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await db`CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews (approved, created_at)`;

    const seeded = {};
    for (const section of ['services', 'work', 'pricing']) {
      const existing = await db`SELECT count(*)::int AS n FROM content WHERE section = ${section}`;
      if (existing[0].n === 0 && Array.isArray(seed[section])) {
        const items = seed[section];
        for (let i = 0; i < items.length; i++) {
          await db`INSERT INTO content (section, position, data)
                   VALUES (${section}, ${i}, ${JSON.stringify(items[i])})`;
        }
        seeded[section] = items.length;
      } else {
        seeded[section] = `skipped (${existing[0].n} rows present)`;
      }
    }

    const reviewCount = await db`SELECT count(*)::int AS n FROM reviews`;
    if (reviewCount[0].n === 0 && Array.isArray(seed.reviews)) {
      for (const r of seed.reviews) {
        await db`INSERT INTO reviews (name, business, text, rating, color, approved)
                 VALUES (${r.name}, ${r.business || ''}, ${r.text}, ${r.rating || 5}, ${r.color || 'blue'}, true)`;
      }
      seeded.reviews = seed.reviews.length;
    } else {
      seeded.reviews = `skipped (${reviewCount[0].n} rows present)`;
    }

    return res.status(200).json({ ok: true, seeded });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
};
