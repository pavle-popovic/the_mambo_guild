1. 🏛️ The "Clave" Economy (Central Bank Policy)
Strict anti-inflationary logic to ensure scarcity, value, and spam prevention.

1.1 The Currency Unit
Name: Clave ( 🥢 )

Visuals: Top Navbar counter. Clicking opens a "Wallet History" modal.

1.2 Income Sources (Supply)
Daily Engagement:

Daily Login: RNG(1, 3) Claves (Base) / RNG(4, 8) Claves (Pro).

Consistency Streak: +10 Claves (Base) / +20 Claves (Pro) every 5 consecutive days.

Community Contributions (The "Work"):

"Accepted Answer" Bounty: +15 Claves (Awarded when your comment is marked as "Solution" by the OP).

"Helpful" Refund: +1 Clave (When your video post receives a "Fire" reaction, capped at 5 refunds per video).

Viral Bounty (Referral):

Reward: +50 Claves to Referrer / +15 Clave Starter Pack to New User.

Course Progression (Milestones): (Removed to prevent grinding).

    Finish a Lesson: +0 Claves

    Finish a Choreography Module: +0 Claves.

    Finish a Course "Week" (Module): +0 Claves.

    Finish a Full Course: +0 Claves.

    Level Up (XP Milestone): +0 Claves.


1.3 Expense Sinks (Demand)
Interactions (The "Skin in the Game" Cost):

React (Fire/Clap/Footwork): Cost -1 Clave (Prevents spamming).

Note: While this costs Claves, it earns Badge XP (See Section 4.3).

Post Comment / Chat: Cost -2 Claves.

Content Creation:

Post Question ("The Lab"): Cost -5 Claves.

Post Video ("The Stage"): Cost -15 Claves.

2. 🏘️ Community Architecture: "The Twin Engines"
2.1 The Toggle Interface
Modes: [ 📺 The Stage ] vs [ 🧠 The Lab ].

2.2 Mode A: "The Stage" (Visual Feed)
Content: Video Posts only.

Toggles: "WIP Mode" (Banner) & Feedback Type ("Hype Me" vs "Coach Me").

2.3 Mode B: "The Lab" (Knowledge Base)
Content: Text Questions + Optional Video Context.

The "Stack Overflow" Solution Logic:

Selector: The Original Poster (OP) sees a ✅ Accept Solution button on all comments.

Action:

The comment moves to the top and gets a Gold Border.

The Helper receives +15 Claves (Financial Reward).

The Helper receives +1 Point towards their "Maestro" Badge (Reputation Reward).

Limit: Only one solution can be accepted per thread.

3. 💾 Content Management
Active Slot Limit: 5 Slots (Base) / 20 Slots (Pro).

Exemption: Videos marked as "Accepted Solutions" do not count toward the slot limit.

4. 👤 Profiles & The "Prestige" Badge System (Major Update)
A multi-tiered reputation system where users grind for status.

4.1 Public User Profile
Header: Profile Pic, Username, Level.

The Trophy Case (New):

Displays the user's earned badges.

Custom Ordering: User can go to "Edit Profile" -> "Badges" to drag and drop the order of badges (e.g., showing off their Diamond badges first).

Visuals: Badges have distinct borders/glows based on tier (Silver = Metallic, Gold = Shiny, Diamond = Blue Glow).

Stats Card: "Solutions Provided" | "Reaction Score" | "Streak".

4.2 Badge Logic: "The 3-Tier System"
Every major action has a progression path: Silver → Gold → Diamond.

Category A: Interaction Badges (Giving)
Trigger: Spending Claves to react to others.

Badge Name: The Critic (Giving Reactions)

Silver: Give 10 Reactions.

Gold: Give 50 Reactions.

Diamond: Give 100 Reactions.

Category B: Social Badges (Receiving)
Trigger: Receiving reactions on your posts/comments.

Badge Name: The Star (Receiving "Fire" or "Claps")

Silver: Receive 10 Total Reactions.

Gold: Receive 50 Total Reactions.

Diamond: Receive 100 Total Reactions.

Category C: Expertise Badges (The "Stack Overflow" Rank)
Trigger: Having your answer marked as "Solution" by an OP.

Badge Name: El Maestro (Accepted Answers)

Silver: 3 Solutions Accepted.

Gold: 5 Solutions Accepted.

Diamond: 10 Solutions Accepted.

Category D: Course Badges (Achievement)
Trigger: Completing specific drill sets.

Badge Name: The Metronome (Timing Drills)

Silver: Complete "Timing Module 1" with >80% score.

Gold: Complete "Timing Module 2" (Clave Training).

Diamond: Perfect score on "The Impossible Beat" Challenge.

4.3 The "Badge Point" Backend Logic
Giving a Reaction:

Effect: -1 Clave (Wallet) AND +1 Count towards "The Critic" Badge.

Receiving a Reaction:

Effect: +1 Count towards "The Star" Badge.

Getting "Accepted Answer":

Effect: +15 Claves (Wallet) AND +1 Count towards "El Maestro" Badge.

5. 🛠️ Technical Requirements
5.1 Database Updates (Schema)
badges Table:

id, name (e.g., 'The Critic'), tier ('silver', 'gold', 'diamond'), threshold (int), icon_url.

user_badges Table:

user_id, badge_id, earned_at, display_order (int - for profile sorting).

user_stats Table (Aggregates for performance):

reactions_given_count

reactions_received_count

solutions_accepted_count

5.2 Frontend Logic
Badge Notification: When a user hits a threshold (e.g., 50th reaction), trigger a ConfettiExplosion and a Modal: "Level Up! You earned The Critic (Gold)."

Profile Drag-and-Drop: Use dnd-kit or similar library to allow users to reorder user_badges in the "Edit Profile" view.

Optimistic UI: When a user clicks "Accept Solution":

Immediately visually mark the comment as Gold.

Send API request.

If success: Trigger +Clave animation for the helper.

5.3 API Security
Self-Voting Guard: Users cannot React to their own posts to farm "The Star" badge.

Self-Accept Guard: Users cannot mark their own comment as the "Accepted Solution" to farm "El Maestro" badges.