import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Resolve the current user's role by calling the backend's authenticated
 * profile endpoint with the request's cookies. We rely on the backend because
 * (a) the JWT doesn't carry a role claim and (b) the secret isn't available
 * on the Edge runtime. One extra request per admin navigation is acceptable.
 */
async function fetchUserRole(request: NextRequest): Promise<string | null> {
    const cookie = request.headers.get('cookie');
    if (!cookie || !cookie.includes('access_token=')) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { cookie },
            // Middleware runs on the Edge — no keepalive, no cache.
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return typeof data?.role === 'string' ? data.role : null;
    } catch {
        return null;
    }
}

// Routes accessible even when the waitlist velvet rope is up.
// Auth routes must be reachable so beta testers can claim accounts.
const PUBLIC_WHEN_WAITLIST = [
    '/waitlist', '/api', '/_next', '/favicon.ico',
    '/login', '/register', '/forgot-password', '/reset-password',
    '/beta', // magic-link landing that sets the bypass cookie
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- Waitlist velvet rope with beta bypass ----------------------------
    const isWaitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true';
    if (isWaitlistMode) {
        const isPublicPath =
            PUBLIC_WHEN_WAITLIST.some(p => path.startsWith(p)) || path.includes('.');

        if (!isPublicPath) {
            const cookieHeader = request.headers.get('cookie') || '';
            const betaKey = process.env.BETA_ACCESS_KEY;

            // Bypass 1: magic-link cookie (set via GET /beta?key=...)
            const hasBetaCookie =
                !!betaKey && cookieHeader.includes(`beta_access=${betaKey}`);

            // Bypass 2: authenticated admin (avoids backend call if cookie passed)
            let isAdmin = false;
            if (!hasBetaCookie && cookieHeader.includes('access_token=')) {
                const role = await fetchUserRole(request);
                isAdmin = role === 'admin';
            }

            if (!hasBetaCookie && !isAdmin) {
                return NextResponse.redirect(new URL('/waitlist', request.url));
            }
        }
    }

    // --- Admin route guard (P1.5) -----------------------------------------
    // Defence in depth: backend endpoints are already protected with
    // `get_admin_user`, but without this guard a non-admin can briefly see
    // the admin shell flashes before the client-side useEffect bounces them.
    if (path.startsWith('/admin')) {
        const role = await fetchUserRole(request);
        if (role !== 'admin') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
