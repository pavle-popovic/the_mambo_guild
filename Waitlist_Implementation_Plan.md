# Waitlist Implementation Plan: "The Velvet Rope"

## Goal Description
Launch a "Velvet Rope" waitlist landing page for *The Mambo Guild* that captures high-intent users, reserves their unique usernames, and immediately assigns an exclusive "Founder's Badge". This must be deployed to production while allowing full-platform development to continue in parallel without data conflicts.

## User Review Required
> [!IMPORTANT]
> **Deployment Strategy**: We will use a **Single Codebase, Dual Environment** strategy. The same code will run in Production (Waitlist Mode) and Development (Full Platform).
> - **Production**: Configured with `NEXT_PUBLIC_WAITLIST_MODE=true`. All routes redirect to the landing page. Connects to `Production_DB`.
> - **Development**: Configured with `NEXT_PUBLIC_WAITLIST_MODE=false`. Full access. Connects to `Development_DB`.

## Proposed Changes

### 1. Database & Migrations
We will utilize the **existing** `users` and `user_profiles` tables. This ensures a "Zero-Migration" go-live event (users are already in the system).

#### [NEW] `backend/scripts/seed_founder_badge.py`
- Script to insert the "Founder's Badge" definition into `badge_definitions`.
- **ID**: `founder_diamond`
- **Tier**: `Diamond`
- **Icon**: Special Gold/Black asset.

#### [MODIFY] `backend/models/user.py`
- Ensure `hashed_password` is nullable (already confirmed).
- Ensure `referral_code` or similar mechanism exists for the "Invite 3 friends" loop. (May need to add `referral_code` column to `user_profiles`).

### 2. Backend Implementation (`backend`)

#### [MODIFY] `backend/routers/auth.py`
- Add `POST /auth/waitlist` endpoint.
- **Input**: Email, Username, Referral Referrer (optional).
- **Logic**:
    1.  Check if Username/Email exists.
    2.  Create `User` (no password yet).
    3.  Create `UserProfile` (reserve username).
    4.  **Award Badge**: Call `badge_service.award_badge(user.id, "founder_diamond")`.
    5.  **Referral Logic**: If `referrer_code` provided, increment referrer's count. Check if they hit 3 invites -> Award "Beta Tester" badge.

### 3. Frontend Implementation (`frontend`)

#### [NEW] `frontend/app/waitlist/page.tsx`
- The "Velvet Rope" UI.
- **Hero**: "Secure your username. Claim Founder Status."
- **Form**: Email + Username input.
- **Success State**: "You are #45. Username @MamboKing reserved." + Referral Link.
- **Visuals**: Art Deco + Cyberpunk aesthetic (Gold/Black/Neon).

#### [MODIFY] `frontend/middleware.ts`
- Implement Logic:
  ```typescript
  if (process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true') {
    if (!req.nextUrl.pathname.startsWith('/waitlist') && !req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/waitlist', req.url));
    }
  }
  ```

## Verification Plan

### Automated Tests
- **Backend**: Test `POST /auth/waitlist` with unique and duplicate data. Verify Badge assignment.
- **Frontend**: Playwright test for the signup flow and referral link generation.

### Manual Verification
1.  **Deployment**: Push to a staging environment with `WAITLIST_MODE=true`.
2.  **Flow**: Sign up as "User A". Check DB for "Founder Badge".
3.  **Referral**: Sign up "User B" using "User A's" link. Check "User A's" stats.
4.  **Bypass**: Attempt to access `/dashboard`. Confirm redirect to `/waitlist`.

## Migration & Future Management Plan
When the full platform is ready to go live:
1.  **Stop Development**: Code freeze.
2.  **Sync Schema**: Apply any *additive* schema changes (new tables like `courses` specific to v1) to `Production_DB`.
3.  **Deploy**: Change `NEXT_PUBLIC_WAITLIST_MODE=false` in Production environment variables.
4.  **Redeploy**: The full platform is now live. Existing Waitlist users can "Log In" (via magic link or "Set Password" flow) and see their profile with the Founder Badge already there.
