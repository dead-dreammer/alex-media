export default function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    // `vercel dev` doesn't inject .env.local into Edge Middleware, so the
    // secret can be absent locally even though the API functions can see it.
    // Don't lock the page in local dev; only enforce once actually deployed.
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development') {
      return new Response('Server misconfigured: ADMIN_SECRET not set', { status: 500 });
    }
    return; // local dev — let the admin page load
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
