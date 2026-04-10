import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /beta?key=<BETA_ACCESS_KEY>
 *
 * Sets an httpOnly cookie that lets the bearer pass the waitlist
 * velvet rope (checked in middleware.ts). Redirect to homepage on
 * success, back to /waitlist on bad/missing key.
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const expected = process.env.BETA_ACCESS_KEY;

  if (expected && key === expected) {
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.set('beta_access', expected, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });
    return res;
  }

  return NextResponse.redirect(new URL('/waitlist', request.url));
}
