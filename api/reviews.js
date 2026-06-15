// GET    /api/reviews?all=1   -> admin (Bearer): every review incl. pending
// POST   /api/reviews          -> public: submit a review (saved as pending)
//                                 admin (Bearer): add a review (auto-approved)
// PATCH  /api/reviews          -> admin: { id, approved } toggle approval
// DELETE /api/reviews?id=123   -> admin: remove a review
const { sql, isAuthed, readJson } = require('../lib/db');

const COLORS = ['blue', 'coral', 'violet', 'lime', 'yellow'];
const clampRating = (r) => Math.max(1, Math.min(5, parseInt(r, 10) || 5));
const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

module.exports = async (req, res) => {
  try {
    const db = sql();

    if (req.method === 'GET') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
      const rows = await db`
        SELECT id, name, business, text, rating, color, approved, created_at
        FROM reviews ORDER BY approved ASC, created_at DESC`;
      return res.status(200).json({ reviews: rows });
    }

    if (req.method === 'POST') {
      const body = readJson(req);
      if (!body) return res.status(400).json({ error: 'Invalid JSON' });

      const name = str(body.name, 80);
      const text = str(body.text, 1000);
      const business = str(body.business, 120);
      const rating = clampRating(body.rating);
      const color = COLORS.includes(body.color) ? body.color : 'blue';
      if (!name || !text) {
        return res.status(400).json({ error: 'Name and review text are required' });
      }

      const admin = isAuthed(req);          // admin-added reviews go live immediately
      const honeypot = str(body.website, 1); // bots fill hidden "website" field
      if (honeypot) return res.status(200).json({ ok: true }); // silently drop

      const approved = admin;
      const inserted = await db`
        INSERT INTO reviews (name, business, text, rating, color, approved)
        VALUES (${name}, ${business}, ${text}, ${rating}, ${color}, ${approved})
        RETURNING id`;
      return res.status(201).json({ ok: true, id: inserted[0].id, pending: !approved });
    }

    if (req.method === 'PATCH') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = readJson(req);
      if (!body || !body.id) return res.status(400).json({ error: 'Missing id' });
      await db`UPDATE reviews SET approved = ${!!body.approved} WHERE id = ${body.id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query && req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await db`DELETE FROM reviews WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
};
