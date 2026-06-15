// Shared helpers for the serverless API routes.
const { neon } = require('@neondatabase/serverless');

let _sql;
// Lazily create the Neon client so a missing URL produces a clean error
// at request time rather than crashing the whole function on import.
function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// Returns true when the request carries the correct admin secret.
function isAuthed(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') && auth.slice(7) === secret;
}

// Parses a JSON body whether Vercel pre-parsed it or handed us a string.
function readJson(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return null; }
  }
  return body && typeof body === 'object' ? body : null;
}

module.exports = { sql, isAuthed, readJson };
