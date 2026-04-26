import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from './i18n/config';
import { isReadyVariant, SEO_ROUTES } from './i18n/seo-routing';

const API_BASE_URL = process.env.API_DIRECT_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const NON_DEFAULT_LOCALES = new Set(LOCALES.filter((l) => l !== DEFAULT_LOCALE));

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
// SEO routes (and their /<locale>/... variants — handled by the locale-prefix
// branch above) must stay crawlable so Google can index them pre-launch and
// hreflang stays consistent. Any path declared in SEO_ROUTES auto-propagates
// here on next deploy.
const PUBLIC_WHEN_WAITLIST = [
    '/waitlist', '/api', '/_next', '/favicon.ico',
    '/login', '/register', '/forgot-password', '/reset-password',
    '/beta', // magic-link landing that sets the bypass cookie
    ...SEO_ROUTES.map((r) => r.path),
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- URL-based locale routing for SEO pages ---------------------------
    // Matches /<locale>/<rest>. If <locale> is one of our non-default locales:
    //   * <rest> is a route that opts into URL locales (blog, pillar pages):
    //     pass through so Next can render app/[locale]/<rest>/page.tsx.
    //     Also set NEXT_LOCALE so the cookie-based <LocaleProvider> agrees.
    //   * <rest> is anything else: redirect to /<rest> and set NEXT_LOCALE.
    //     This is what makes /es/courses cleanly land on /courses in Spanish
    //     for app-internal pages that are NOT URL-localized.
    {
        const segs = path.split('/').filter(Boolean);
        if (segs.length >= 1 && NON_DEFAULT_LOCALES.has(segs[0] as any)) {
            const locale = segs[0];
            const rest = '/' + segs.slice(1).join('/');
            if (isReadyVariant(rest, locale as any)) {
                // The (path, locale) variant has a hand-translated body.
                // Pass through so Next renders app/[locale]/<rest>/page.tsx.
                const response = NextResponse.next();
                response.cookies.set('NEXT_LOCALE', locale, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                    sameSite: 'lax',
                });
                return response;
            }
            // Either the path doesn't opt into URL locales, or the locale
            // doesn't have a translation yet. Redirect to the unprefixed
            // path and pin the locale in a cookie so the cookie-based
            // LocaleProvider still localises the chrome.
            const url = request.nextUrl.clone();
            url.pathname = rest === '/' ? '/' : rest;
            const response = NextResponse.redirect(url);
            response.cookies.set('NEXT_LOCALE', locale, {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: 'lax',
            });
            return response;
        }
    }

    // --- Waitlist velvet rope with beta bypass ----------------------------
    // NOTE: NEXT_PUBLIC_* vars are inlined at build time and are NOT available
    // as real runtime env vars in Edge middleware. Use WAITLIST_MODE (server-side)
    // as the authoritative variable, with NEXT_PUBLIC_WAITLIST_MODE as fallback
    // for local dev compatibility.
    const isWaitlistMode =
        process.env.WAITLIST_MODE === 'true' ||
        process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true';
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

    // --- Admin route guard (best-effort) ------------------------------------
    // Backend endpoints are always protected with `get_admin_user`.
    // This guard is cosmetic (prevents a non-admin flash of the admin shell).
    // It can only work when the access_token cookie is visible to the Edge
    // middleware. In production the cookie is set on the Railway domain and is
    // NOT forwarded through Vercel — so we fail-open: if we can't determine
    // the role, we let the request through and rely on client-side + backend
    // guards.
    if (path.startsWith('/admin')) {
        const cookie = request.headers.get('cookie') || '';
        if (cookie.includes('access_token=')) {
            const role = await fetchUserRole(request);
            // Only redirect if we POSITIVELY know the user is NOT admin
            if (role !== null && role !== 'admin') {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', path);
                return NextResponse.redirect(loginUrl);
            }
        }
        // If no cookie or role unknown — pass through (backend protects admin API)
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
