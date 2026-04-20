# Event Catalog

Canonical taxonomy of every event written to `user_events` by `services.analytics_service.track_event`. Single source of truth for event names, expected properties, and whether the event is forwarded to Meta Conversions API (CAPI).

## Pipeline overview

```
track_event(db, event_name, user_id, properties, ...)
  └─► user_events row (always)
  └─► meta_capi_service.dispatch_event()  ← only if event_name ∈ CONVERSION_EVENTS
```

Every event lands in the append-only `user_events` table. The subset in the `CONVERSION_EVENTS` allowlist (defined in `services/analytics_service.py`) is additionally forwarded to Meta for ad optimisation.

Browser Pixel events must use the **same `event_id`** the server generated so Meta deduplicates them. Server returns the id via fields like `TokenResponse.analytics_event_id` or `CheckoutSessionResponse.analytics_event_id`; the browser then calls `echoServerEvent(eventName, serverEventId, customData)`.

## Conversion events (forwarded to Meta CAPI)

These are the events that drive value-based bidding. Getting `value` right matters.

| Event | Source | Value | Required props | Notes |
|---|---|---|---|---|
| `PageView` | client (`MetaPixel`) | — | `path` | Fires on route change. Used for retargeting audiences. |
| `Lead` | server (`routers/auth.join_waitlist`) | 2.0 USD | — | Placeholder EV for top-of-funnel. Adjust once we have conversion data. |
| `CompleteRegistration` | server (`routers/auth.register`) | 5.0 USD | — | Mid-funnel. Meta treats this distinctly from Lead. |
| `InitiateCheckout` | client + server (`routers/payments.create_checkout_session`) | 39 or 59 USD | `tier` | Strong intent signal. Value = tier price. |
| `StartTrial` | server (`routers/payments` webhook) | 0 USD | `tier`, `predicted_ltv` | `predicted_ltv` = tier price; hint for value-based bidding during free trial. |
| `Subscribe` | server (`routers/payments._fire_subscribe_and_purchase`) | **actual `amount_paid / 100`** | `tier`, `currency` | Ground-truth revenue. Never hardcode — use Stripe invoice. |
| `Purchase` | server (`routers/payments._fire_subscribe_and_purchase`) | **actual `amount_paid / 100`** | `tier`, `currency` | Fired alongside Subscribe; some advertisers optimise for one vs the other. |

`CONVERSION_EVENTS` allowlist in `services/analytics_service.py`:

```python
CONVERSION_EVENTS = frozenset({
    "PageView",
    "Lead",
    "CompleteRegistration",
    "InitiateCheckout",
    "StartTrial",
    "Subscribe",
    "Purchase",
})
```

Adding a new Meta event = one-line set change.

## ML-only events (DB-only, no CAPI)

Captured from day one so the "first 7 days" feature window is complete whenever a data scientist builds the churn/conversion model. **Do not drop these** — missing early-days data permanently handicaps the model.

| Event | Source | Properties | ML feature |
|---|---|---|---|
| `LessonCompleted` | `routers/progress.complete_lesson` | `lesson_id`, `lesson_title`, `world_slug`, `is_boss_battle`, `xp`, `leveled_up` | Completion velocity — core engagement signal |
| `VideoHeartbeat` | `routers/progress.video_heartbeat` | `lesson_id`, `position_seconds`, `duration_seconds`, `percent` | Max watch % in first 7 days is a top churn predictor |
| `BadgeEarned` | `services/badge_service.award_badge` | `badge_id`, `badge_slug`, `badge_name`, `tier`, `category` | Early badges = habituation |
| `LevelUp` | `services/gamification_service.award_xp` | `old_level`, `new_level`, `xp_total`, `reason` | Progression pace |
| `StreakMilestone` | `services/gamification_service.update_streak` | `days` (∈ {7, 30, 100, 365}) | Retention signal |
| `ClaveEarned` | `services/clave_service.earn_claves` | `amount`, `reason`, `reference_id`, `new_balance` | Economy engagement |
| `ClaveSpent` | `services/clave_service.spend_claves` | `amount`, `reason`, `reference_id`, `new_balance` | Economy engagement |
| `PostCreated` | `routers/community.create_post` | `post_id`, `post_type` (stage/lab), `has_video`, `tags`, `is_wip`, `feedback_type` | Social engagement — #1 retention predictor |
| `ReactionGiven` | `routers/community.add_reaction` | `post_id`, `reaction_type` | Social engagement |
| `ReplyPosted` | `routers/community.add_reply` | `post_id`, `has_video` | Social engagement |
| `AnswerAccepted` | `routers/community.mark_solution` | `post_id`, `reply_id`, `helper_user_id` | Quality contribution |
| `CommunityVideoReady` | `routers/mux.mux_webhook_handler` | `post_id`, `post_type`, `asset_id` | High-intent content creation |
| `CoachingSubmissionUploaded` | `routers/mux.mux_webhook_handler` | `asset_id`, `playback_id` | Premium-tier engagement (Guild Master) |
| `SubscriptionCanceled` | `routers/payments` webhook | `tier`, `reason` | **Churn label** |

## First-7-days feature query

Template for the data scientist once ≥500 users have ≥1 month of history:

```sql
SELECT
    user_id,
    -- Lesson / watch features
    COUNT(*) FILTER (WHERE event_name = 'LessonCompleted') AS lessons_completed_w1,
    MAX((properties->>'percent')::int) FILTER (WHERE event_name = 'VideoHeartbeat') AS max_video_watch_pct_w1,
    BOOL_OR((properties->>'is_boss_battle')::boolean) FILTER (WHERE event_name = 'LessonCompleted') AS beat_boss_w1,
    -- Gamification
    COUNT(*) FILTER (WHERE event_name = 'BadgeEarned') AS badges_w1,
    MAX((properties->>'new_level')::int) FILTER (WHERE event_name = 'LevelUp') AS level_w1,
    MAX((properties->>'days')::int) FILTER (WHERE event_name = 'StreakMilestone') AS streak_milestone_w1,
    -- Economy
    COALESCE(SUM((properties->>'amount')::int) FILTER (WHERE event_name = 'ClaveSpent'), 0) AS claves_spent_w1,
    -- Social
    COUNT(*) FILTER (WHERE event_name = 'PostCreated' AND properties->>'post_type' = 'stage') AS stage_posts_w1,
    COUNT(*) FILTER (WHERE event_name = 'PostCreated' AND properties->>'post_type' = 'lab')   AS lab_posts_w1,
    COUNT(*) FILTER (WHERE event_name = 'ReactionGiven') AS reactions_given_w1,
    COUNT(*) FILTER (WHERE event_name = 'ReplyPosted')   AS replies_w1,
    COUNT(*) FILTER (WHERE event_name = 'AnswerAccepted') AS solutions_w1,
    COUNT(*) FILTER (WHERE event_name = 'CommunityVideoReady') AS videos_uploaded_w1,
    COUNT(*) FILTER (WHERE event_name = 'CoachingSubmissionUploaded') AS coaching_submissions_w1,
    -- Labels
    BOOL_OR(event_name = 'Subscribe') AS converted,
    BOOL_OR(event_name = 'SubscriptionCanceled') AS churned
FROM user_events
WHERE user_id = :uid
  AND created_at BETWEEN :signup_at AND :signup_at + INTERVAL '7 days'
GROUP BY user_id;
```

Materialise this as `mv_user_w1_features` once daily volume justifies refreshing a view (~50 DAU+).

## Adding a new event

1. Pick a `PascalCase` name. Prefer verbs (`PostCreated`) over nouns (`NewPost`).
2. Call `track_event(db, event_name="…", user_id=…, properties={...})` at the insertion point. Wrap in `try/except` — analytics must never break the business flow.
3. If Meta should see it, add the name to `CONVERSION_EVENTS` and include a `value`/`currency` when it represents revenue intent.
4. Add a row to this table.
5. If the new event adds a top-5 ML feature, extend the feature-query template above.

## Operational notes

- **Non-blocking dispatch**: CAPI goes through FastAPI `BackgroundTasks`. A Meta outage must never delay a Stripe webhook (Stripe retries would duplicate subscription bonuses).
- **PII hashing**: `utils/meta_user_data.build_user_data` SHA-256 hashes email/phone/name/external_id (lowercase + trimmed). Only IP / UA / `_fbp` / `_fbc` are sent unhashed — per Meta spec.
- **Idempotency**: the `user_events.event_id` column is `UNIQUE`. Client-side retries with the same id are no-ops.
- **Attribution persistence**: `capture_first_touch()` writes `fbp`, `fbc`, `first_touch_utm`, `first_touch_landing_url`, `first_touch_referrer`, `first_touch_at` onto `UserProfile` on first signup and waitlist. Later conversions (e.g. trial-to-paid 7 days after ad click) still get credited to the original campaign.
- **Consent**: GDPR/Consent Mode v2 is intentionally out of scope here. Add a guard on `track_event` before heavy paid acquisition in EU.
