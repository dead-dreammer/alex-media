export default function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return new Response('Server misconfigured: ADMIN_SECRET not set', { status: 500 });
  }

  if (auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    const colonIdx = decoded.indexOf(':');
    const pass = colonIdx !== -1 ? decoded.slice(colonIdx + 1) : decoded;
    if (pass === secret) return; // pass through to static file
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ['/admin.html', '/admin.js'],
};
