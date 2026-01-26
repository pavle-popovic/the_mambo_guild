
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if Waitlist Mode is active
    const isWaitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true';

    if (isWaitlistMode) {
        const path = request.nextUrl.pathname;

        // Allow access to:
        // 1. The waitlist page itself
        // 2. API routes (for signup/check status)
        // 3. Static assets/resources (images, _next, favicon usually handled by config but good to be safe)
        if (
            !path.startsWith('/waitlist') &&
            !path.startsWith('/api') &&
            !path.startsWith('/_next') &&
            !path.startsWith('/favicon.ico') &&
            !path.includes('.') // basic check for files/images
        ) {
            return NextResponse.redirect(new URL('/waitlist', request.url));
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
