// GET  /api/content        -> public: { services, work, pricing, reviews(approved) }
// POST /api/content        -> admin (Bearer secret): replace one section's items
//                             body: { section: 'services'|'work'|'pricing', items: [...] }
const { sql, isAuthed, readJson } = require('../lib/db');

const EDITABLE = ['services', 'work', 'pricing', 'logos', 'workStats', 'cases', 'pricingPage', 'addons', 'faqs'];

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const db = sql();
      const rows = await db`SELECT section, data FROM content ORDER BY section, position`;
      const approvedReviews = await db`
        SELECT name, business, text, rating, color
        FROM reviews WHERE approved = true ORDER BY created_at DESC`;

      const out = {};
      for (const s of EDITABLE) out[s] = [];
      for (const r of rows) {
        (out[r.section] || (out[r.section] = [])).push(r.data);
      }
      out.reviews = approvedReviews;
      return res.status(200).json(out);
    }

    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = readJson(req);
      if (!body) return res.status(400).json({ error: 'Invalid JSON' });

      const { section, items } = body;
      if (!EDITABLE.includes(section)) {
        return res.status(400).json({ error: 'section must be services, work, or pricing' });
      }
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items must be an array' });
      }

      const db = sql();
      // Replace the whole section: clear then re-insert in order.
      await db`DELETE FROM content WHERE section = ${section}`;
      for (let i = 0; i < items.length; i++) {
        await db`INSERT INTO content (section, position, data)
                 VALUES (${section}, ${i}, ${JSON.stringify(items[i])})`;
      }
      return res.status(200).json({ ok: true, section, count: items.length });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
};
