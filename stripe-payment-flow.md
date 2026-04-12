# The Mambo Guild — Stripe Payment Flow

## Products & Price IDs

| Tier | Internal enum | Display | Price | Stripe Price ID | Seat cap | Trial |
|---|---|---|---|---|---|---|
| Rookie | `ROOKIE` | Guest List | Free | — | ∞ | — |
| Pro | `ADVANCED` | Pro | $39/mo | `price_1TKKp5…192X` | ∞ | 7 days, once per email |
| Guild Master | `PERFORMER` | VIP | $59/mo | `price_1TKKwC…uHml` | **30** | None |

Enums live in `models/user.py` (`SubscriptionStatus`, `SubscriptionTier`).

## Subscription state machine

```
                   ┌──────────────┐
                   │  ROOKIE      │  (no Stripe sub, or post-cancel)
                   └───┬──────────┘
          checkout     │
                       ▼
                   ┌──────────────┐
   trial?  YES ──► │  TRIALING    │  (7 days, ADVANCED only)
                   └───┬──────────┘
                       │  first real charge
                       ▼
                   ┌──────────────┐
   trial?  NO   ──►│  ACTIVE      │◄──────────┐
                   └───┬──────────┘           │
                       │                       │ resume
          renewal fail │                       │ (un-cancel)
                       ▼                       │
                   ┌──────────────┐            │
                   │  PAST_DUE    │────────────┘
                   └───┬──────────┘
                       │  Stripe gives up
                       ▼
                   ┌──────────────┐
                   │  CANCELED    │──► tier resets to ROOKIE
                   └──────────────┘
```

`cancel_at_period_end=True` is a flag overlaid on ACTIVE/TRIALING — access persists until `current_period_end`, then `customer.subscription.deleted` fires and we drop to ROOKIE.

---

## Flow 1 — New signup, Rookie → Pro (with 7-day trial)

**Preconditions:** user has a `User` row, `UserProfile.has_used_trial=False`, no prior Stripe customer for this email.

1. **Client** → `POST /api/payments/create-checkout-session { price_id: ADVANCED, success_url, cancel_url }`
2. **Guardrails:**
   - `price_id` must be one of the two known constants → else **400**.
   - `success_url` / `cancel_url` must resolve to a host in `FRONTEND_URL` or `CORS_ORIGINS` → else **400** *(open-redirect defense)*.
   - User must not already hold an ACTIVE/TRIALING sub → else **400**.
3. **Stripe customer:** `stripe.Customer.list(email)` first; reuse if found, fix its metadata. Otherwise create. No duplicate customers.
4. **Trial eligibility** (all must hold):
   - `profile.has_used_trial == False`
   - `price_id == ADVANCED_PRICE_ID` (Guild Master never gets a trial)
   - `_email_has_prior_stripe_subscription(email) == False` — Stripe-side lookup across all customers for this email; if any has any subscription in any state, **no trial**. Fails closed on error.
5. **Create Checkout Session** with `trial_period_days=7` + `trial_settings.end_behavior.missing_payment_method="cancel"`.
6. **User pays on Stripe-hosted page.** Card is held, not charged.
7. **Webhook burst arrives:**
   - `customer.subscription.created` → idempotency insert (`stripe_webhook_events.event_id`), tier resolved via `_resolve_tier_from_items` (price.id first, lookup_key fallback), status=TRIALING, tier=ADVANCED, `current_period_end` set, **`profile.has_used_trial=True` burned now** so a cancel-and-retry can't get a second trial.
   - `invoice.payment_succeeded` may fire with `amount_paid=0` for the $0 trial invoice → idempotency commit, but `is_paid_invoice=False` → **no XP bonus, no badge** (reserved for first real payment).
8. **User redirected to** `success_url` (validated host).

### Day 7 — trial converts
- `invoice.payment_succeeded` with `amount_paid=3900` → `is_paid_invoice=True` → `award_subscription_bonus` (one-per-user-per-tier guard) + badge. Sub stays ACTIVE.
- `customer.subscription.updated` flips status TRIALING → ACTIVE.

### Day 7 — trial fails (no card / declined)
- Stripe fires `customer.subscription.deleted` → handler filters on `sub_id AND customer_id` → flips DB row to CANCELED, tier ROOKIE. `has_used_trial` stays `True`.

---

## Flow 2 — Direct Pro signup (no trial)

Same as Flow 1 but trial eligibility fails (email already has a prior Stripe sub, or `has_used_trial=True`). `trial_period_days=None`, user is charged immediately.
- `customer.subscription.created` → status=ACTIVE immediately.
- `invoice.payment_succeeded` with `amount_paid > 0` → bonus + badge granted (first time for this tier).

---

## Flow 3 — Guild Master signup

1. Client posts checkout with `price_id = PERFORMER_PRICE_ID`.
2. **Seat cap guard:** `_lock_guild_master_seats(db)` acquires `pg_advisory_xact_lock(7348291)` → `_guild_master_seats_taken(db)` counts ACTIVE+TRIALING PERFORMER rows → if `>= 30`, **409** "fully booked". Lock released at txn commit/rollback.
3. Trial never applied (gate #4 requires `price_id == ADVANCED_PRICE_ID`).
4. User charged full $59 at checkout.
5. Webhooks land, sub becomes ACTIVE+PERFORMER.
6. Public `GET /api/payments/guild-master-seats` (Cache-Control: max-age=30) reflects the new count on next poll.

---

## Flow 4 — Pro → Guild Master upgrade

1. Client → `POST /api/payments/update-subscription { new_price_id: PERFORMER }`
2. **Guardrails:**
   - Price id in allowlist.
   - User has a sub in ACTIVE or TRIALING status with a `stripe_subscription_id`.
   - **Seat cap lock + check** (same pattern as new checkout; skipped if user is already PERFORMER).
3. Retrieve Stripe sub; **verify `stripe_subscription.customer == subscription.stripe_customer_id`** — else **400** "inconsistent".
4. Build modify kwargs:
   - `items=[{id: item0.id, price: PERFORMER}]`
   - `proration_behavior="always_invoice"` (immediate prorated charge for the extra $20)
   - `cancel_at_period_end=False` (upgrading un-cancels a scheduled cancel — commitment signal)
   - If user was TRIALING and upgrading to PERFORMER: `trial_end="now"` so the trial ends immediately, full $59 charged. Local DB status flipped to ACTIVE.
5. `stripe.Subscription.modify(...)`.
6. Read `current_period_end` defensively: root first, then `items[0].current_period_end` via `.get()` (works across Stripe 2025+ API versions AND the StripeObject.items ↔ dict.items collision).
7. Persist: `tier=PERFORMER`, `current_period_end=...`, `cancel_at_period_end=False`.
8. Return to client; client calls `refreshUser()` + `refreshSeats()` in-place (no nav).
9. Webhook `customer.subscription.updated` lands shortly after and reconciles.

### First-time PERFORMER bonus
On the next `invoice.payment_succeeded` (the prorated invoice if upgrade mid-cycle), `award_subscription_bonus` checks `ClaveTransaction(reason="subscription_bonus:performer", user_id=...)` — if none exists, grants. If the user had previously held PERFORMER, already granted → skipped.

---

## Flow 5 — Guild Master → Pro downgrade

1. Client opens downgrade confirmation modal (state-driven, matches `SubscriptionManager` style).
2. Client → `POST /api/payments/update-subscription { new_price_id: ADVANCED }`.
3. Same guardrails as upgrade (price allowlist, status check, customer match). Seat cap *not* checked (downgrade frees a seat, doesn't consume).
4. `stripe.Subscription.modify` with `proration_behavior="always_invoice"` → Stripe issues a prorated credit to the customer balance.
5. DB flips to `tier=ADVANCED` immediately.
6. ⚠️ **Known deferred issue (#13):** this makes upgrade→downgrade→upgrade cycle-abuse theoretically possible — proper fix is a `SubscriptionSchedule` to defer the tier flip to period end. Mitigated by:
   - One-time welcome bonus per tier (no XP farming).
   - Seat cap on the upgrade side.
   - No Guild Master access extension during the downgrade cycle (tier flips immediately).

---

## Flow 6 — Cancel subscription (retention-friendly)

1. Client → `POST /api/payments/cancel-subscription`.
2. Guardrails: status ACTIVE/TRIALING, has `stripe_subscription_id` (else drop to ROOKIE immediately).
3. `stripe.Subscription.modify(cancel_at_period_end=True)` → sub stays ACTIVE/TRIALING until `current_period_end`, then Stripe deletes it.
4. DB: `cancel_at_period_end=True`. Tier/status unchanged. **User keeps full access until period end.**
5. At period end: `customer.subscription.deleted` fires → handler filters on `(sub_id, customer_id)` → status=CANCELED, tier=ROOKIE, `cancel_at_period_end=False`.

---

## Flow 7 — Resume (un-cancel) before period end

1. Client → `POST /api/payments/resume-subscription`.
2. Guardrails: has sub, has `cancel_at_period_end=True`, has `stripe_subscription_id`.
3. `stripe.Subscription.modify(cancel_at_period_end=False)`.
4. DB mirror. User back to normal renewal cycle.

---

## Flow 8 — Renewal failure / dunning

Day 30 charge fails (expired card, insufficient funds, etc.):

1. `invoice.payment_failed` → currently unhandled (no-op, idempotency row committed). Access continues until Stripe gives up.
2. `customer.subscription.updated` → status=`past_due` → handler mirrors to `SubscriptionStatus.PAST_DUE`. **Tier stays** (we show "your access is expiring" UX until final delete). `cancel_at_period_end` mirrored.
3. Stripe retries per smart retry policy. If eventual success → `customer.subscription.updated` → status=ACTIVE, tier preserved.
4. If Stripe exhausts retries → `customer.subscription.deleted` → CANCELED, tier=ROOKIE.

**Access gates** (`courses.py`, `progress.py`, `clave_service.py`, `post_service.py`, `premium.py`) all check `status in (ACTIVE, TRIALING)` — a PAST_DUE user loses paid content immediately at the content layer while their tier row sits as a breadcrumb for the retention UX. `is_guild_master` additionally checks `current_period_end > now` as defense-in-depth.

---

## Webhook idempotency & ordering

Every webhook entry starts the same way:

1. Verify `stripe-signature` against `STRIPE_WEBHOOK_SECRET` → **400** on mismatch.
2. `INSERT INTO stripe_webhook_events (event_id, event_type)` — PK collision → already processed → return **200 `{status: already_processed}`**.
3. Dispatch by `event["type"]`.
4. **No exceptions propagate as 5xx** from within dispatch — they're caught, logged, rolled back, and fall through to **200**. This prevents Stripe from retrying into a consumed idempotency slot and looping.

Events handled:

| Event | What it does |
|---|---|
| `customer.subscription.created` | Create/update sub row; burn `has_used_trial` if TRIALING. |
| `customer.subscription.updated` | Mirror all states (trialing/active/past_due/canceled/incomplete). Promote tier only on ACTIVE/TRIALING. On CANCELED, reset tier to ROOKIE. Mirror `cancel_at_period_end`. |
| `invoice.payment_succeeded` | Resolve tier from `price.id`; if `amount_paid > 0`, grant one-time welcome bonus + badge. Fallback: mint/update sub row from validated `metadata.user_id`. |
| `customer.subscription.deleted` | Filter on `(sub_id, customer_id)` — drop to CANCELED/ROOKIE. |

All other events are dropped silently (idempotency row already protects against replays).

---

## Access-gate matrix

| Content / feature | Gate | Trial users | Past_due users |
|---|---|---|---|
| Guild courses / choreos (courses.py) | `status ∈ {ACTIVE, TRIALING}` | ✅ | ❌ |
| Progress tracking (progress.py) | same | ✅ | ❌ |
| Clave community posts (post_service, clave_service) | same | ✅ | ❌ |
| Guild Master perks (premium.py) | `status==ACTIVE AND tier==PERFORMER AND period_end>now` | ❌ (never trialable) | ❌ |
| Free choreo (Cha Cha Cha) | no gate | ✅ | ✅ |

---

## Trial abuse hardening summary

Every "new trial?" decision runs this gauntlet:

1. Local: `UserProfile.has_used_trial == False`?
2. Local: requested `price_id == ADVANCED_PRICE_ID`?
3. Stripe-side: `Customer.list(email=)` → for each match `Subscription.list(status='all', limit=1)` → any hit = ineligible.
4. Burn flag immediately on `customer.subscription.created` with status=trialing (so cancel-and-retry flow loses the trial on the retry even before Stripe's webhook lands for the cancel).
5. Fail-closed if Stripe lookup errors.

Not caught: same-card-different-email (would need a `payment_method.fingerprint` column + migration — known gap, acceptable for beta).

---

## Seat cap (Guild Master) hardening summary

| Layer | What |
|---|---|
| UI (landing + pricing) | Live counter via `GET /guild-master-seats`, "Fully Booked — Join Waitlist" CTA when full. |
| API — `create-checkout-session` | Advisory lock + count; 409 if ≥30. Blocks Stripe checkout session creation. |
| API — `update-subscription` | Advisory lock + count (only when not already PERFORMER); 409 if ≥30. |
| DB query | Counts ACTIVE + TRIALING PERFORMER rows (belt-and-braces: Guild Master has no trial, but the count is safe either way). |
| Cache | Public seats endpoint has `Cache-Control: public, max-age=30` — prevents scraper hammering. |

Not covered: a webhook race where two `customer.subscription.created` events both land at taken=29 simultaneously. Advisory lock is transaction-scoped and the webhook handler commits inside the lock window, but webhooks are serialized in practice by the router. Acceptable.

---

## Deferred items (followups)

- **#11 Rate limiting** — no limiter on checkout/update/cancel/resume endpoints. Reasonable for beta; add `slowapi` before public launch.
- **#13 Proper downgrade scheduling** — `stripe.SubscriptionSchedule` to defer tier flip to period end.
- **#20 Trial-burn timing** — currently burns on first `trialing` event; a user who cancels within 1 minute still "used" their trial. Acceptable.
- **Card-fingerprint trial abuse** — same card + new email bypasses #3. Needs schema change.

---

## Quick reference — files

| File | Role |
|---|---|
| `backend/routers/payments.py` | Checkout / update / cancel / resume / webhook / seats endpoint |
| `backend/routers/premium.py` | `is_guild_master` gate + Guild Master-only endpoints |
| `backend/services/clave_service.py` | `award_subscription_bonus` idempotent welcome-bonus logic |
| `backend/services/stripe_service.py` | Thin wrapper around `stripe.checkout.Session.create` |
| `backend/models/user.py` | `Subscription`, `SubscriptionStatus`, `SubscriptionTier` |
| `backend/models/payment.py` | `StripeWebhookEvent` idempotency table (PK on `event_id`) |
| `frontend/app/pricing/page.tsx` | Upgrade / downgrade UX + inline modal |
| `frontend/components/SubscriptionManager.tsx` | Profile-page cancel/resume flow |
| `frontend/components/landing/LandingPricingSection.tsx` | Public pricing + live seats |
