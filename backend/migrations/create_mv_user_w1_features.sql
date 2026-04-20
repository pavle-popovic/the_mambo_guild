-- Materialised view: per-user first-7-days feature vector for churn/conversion ML.
--
-- Status: STUB — not populated in production until we have ≥500 users with
-- enough tenure to label. Creating it now so the schema is frozen alongside
-- the event catalog and the data scientist can start querying the moment
-- volume justifies refresh.
--
-- Refresh strategy (once enabled):
--   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_w1_features;
-- Run nightly via cron. CONCURRENTLY requires the UNIQUE INDEX below.
--
-- Labels:
--   converted — user has at least one `Subscribe` event AFTER the 7-day window
--   churned   — user has a `SubscriptionCanceled` event OR no login in 30d
--               (the latter half is computed at query time against UserProfile;
--                this view only captures the event-based half)
--
-- Feature window: [user.created_at, user.created_at + 7 days)

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_w1_features AS
WITH signup AS (
    SELECT
        u.id AS user_id,
        u.created_at AS signup_at
    FROM users u
),
w1 AS (
    SELECT
        s.user_id,
        s.signup_at,
        e.event_name,
        e.properties,
        e.value,
        e.created_at
    FROM signup s
    LEFT JOIN user_events e
        ON e.user_id = s.user_id
       AND e.created_at >= s.signup_at
       AND e.created_at <  s.signup_at + INTERVAL '7 days'
)
SELECT
    user_id,
    MIN(signup_at) AS signup_at,

    -- Lesson / watch
    COUNT(*) FILTER (WHERE event_name = 'LessonCompleted')                        AS lessons_completed_w1,
    MAX((properties->>'percent')::int) FILTER (WHERE event_name = 'VideoHeartbeat') AS max_video_watch_pct_w1,
    BOOL_OR((properties->>'is_boss_battle')::boolean) FILTER (WHERE event_name = 'LessonCompleted') AS beat_boss_w1,

    -- Gamification
    COUNT(*) FILTER (WHERE event_name = 'BadgeEarned')                            AS badges_w1,
    MAX((properties->>'new_level')::int) FILTER (WHERE event_name = 'LevelUp')    AS level_w1,
    MAX((properties->>'days')::int) FILTER (WHERE event_name = 'StreakMilestone') AS streak_milestone_w1,

    -- Economy
    COALESCE(SUM((properties->>'amount')::int) FILTER (WHERE event_name = 'ClaveSpent'), 0)  AS claves_spent_w1,
    COALESCE(SUM((properties->>'amount')::int) FILTER (WHERE event_name = 'ClaveEarned'), 0) AS claves_earned_w1,

    -- Social (top retention predictor per product hypothesis)
    COUNT(*) FILTER (WHERE event_name = 'PostCreated' AND properties->>'post_type' = 'stage') AS stage_posts_w1,
    COUNT(*) FILTER (WHERE event_name = 'PostCreated' AND properties->>'post_type' = 'lab')   AS lab_posts_w1,
    COUNT(*) FILTER (WHERE event_name = 'ReactionGiven')                                      AS reactions_given_w1,
    COUNT(*) FILTER (WHERE event_name = 'ReplyPosted')                                        AS replies_w1,
    COUNT(*) FILTER (WHERE event_name = 'AnswerAccepted')                                     AS solutions_w1,
    COUNT(*) FILTER (WHERE event_name = 'CommunityVideoReady')                                AS videos_uploaded_w1,
    COUNT(*) FILTER (WHERE event_name = 'CoachingSubmissionUploaded')                         AS coaching_submissions_w1,

    -- Funnel state at end of week 1
    BOOL_OR(event_name = 'StartTrial')            AS started_trial_w1,
    BOOL_OR(event_name = 'Subscribe')             AS subscribed_w1,
    BOOL_OR(event_name = 'SubscriptionCanceled')  AS canceled_w1
FROM w1
GROUP BY user_id;

-- CONCURRENTLY refresh requires this unique index.
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_user_w1_features_user_id
    ON mv_user_w1_features (user_id);

-- Helpful secondary index for cohort queries.
CREATE INDEX IF NOT EXISTS ix_mv_user_w1_features_signup_at
    ON mv_user_w1_features (signup_at);
