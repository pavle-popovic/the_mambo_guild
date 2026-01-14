# 📂 Product Requirement Document: The Mambo Inn Ecosystem
**Version:** 4.0 (Final "Mambo Overflow" Architecture)
**Objective:** Build a high-retention, self-cleaning "Gamified Community" for Mambo dancers that balances social validation (Instagram) with technical growth (Stack Overflow).

---

## 1. 🏛️ The "Clave" Economy (Central Bank Policy)
*Strict anti-inflationary logic to ensure scarcity, value, and spam prevention.*

### 1.1 The Currency Unit
* **Name:** Clave ( 🥢 )
* **Visuals:** Top Navbar counter (e.g., `🥢 45`). Clicking opens a "Wallet History" modal showing last 20 transactions.

### 1.2 Income Sources (Supply)
* **Daily Engagement:**
    * **Daily Login:** `RNG(1, 3)` Claves (Base Users) / `RNG(4, 8)` Claves (Pro Users).
    * **Consistency Streak:** +10 Claves (Base) / +20 Claves (Pro) every 5 consecutive days of login. (Resets to 0 if a day is missed).
* **Course Progression (Milestones):**
    * **Finish a Lesson:** +0 Claves (Removed to prevent grinding).
    * **Finish a Choreography Module:** +10 Claves.
    * **Finish a Course "Week" (Module):** +10 Claves.
    * **Finish a Full Course:** +20 Claves.
    * **Level Up (XP Milestone):** +5 Claves.
* **Community Contributions (The "Work"):**
    * **"Accepted Answer" Bonus:** +10 Claves (When your answer is marked "Solution" by OP).
    * **"Helpful" Refund:** +1 Clave (When your video post receives a "Fire" reaction, capped at 5 refunds per video).
* **Viral Bounty (Referral):**
    * **Trigger:** A new user purchases a subscription using a unique referral link.
    * **Reward:** **+50 Claves** to the Referrer.
    * **Incentive:** The New User receives a **+15 Clave Starter Pack**.

### 1.3 Expense Sinks (Demand)
* **Interactions:**
    * **React (Fire/Clap/Footwork):** Cost `-1 Clave`.
    * **Post Comment / Chat:** Cost `-2 Claves`.
* **Content Creation:**
    * **Post Question ("The Lab"):** Cost `-5 Claves`.
    * **Post Video ("The Stage"):** Cost `-15 Claves`.
* **Logic:** If `Wallet < Cost`, trigger "Insufficient Funds" modal with CTA: "Complete a Drill or Login tomorrow to earn more."

---

## 2. 🏘️ Community Architecture: "The Twin Engines"
*A unified feed with high-level mode switching.*

### 2.1 The Toggle Interface
* **Component:** Segmented Control (Tabs) at the top of the Community page.
* **Modes:** `[ 📺 The Stage ]` vs `[ 🧠 The Lab ]`.

### 2.2 Mode A: "The Stage" (Visual Feed)
* **Purpose:** Social validation, progress sharing, "Hype."
* **Content:** Video Posts only.
* **UX Layout:** Large Cards (Instagram style). Comments hidden by default (click to expand).
* **Posting Flow (Fear Reduction):**
    * **Toggle 1: "WIP Mode":** If selected, adds a "🚧 Work in Progress" banner over the video.
    * **Toggle 2: Feedback Type:**
        * *"Just Hype Me"* (Disables text comments, allows only Reactions).
        * *"Coach Me"* (Enables text comments).
* **Reactions:** Custom icons (Fire, Ruler, Clapping Hands).

### 2.3 Mode B: "The Lab" (Knowledge Base)
* **Purpose:** Q&A, Technical help, Debugging.
* **Content:** Text Questions + Optional Video Context.
* **UX Layout:** Compact List (Stack Overflow style).
    * **Status Indicators:** "Unsolved" (Grey) vs "Solved" (Green).
* **The "Solution" Logic:**
    * Original Poster (OP) sees a `✅ Mark as Solution` button on comments.
    * **Action:** Moves comment to top, highlights it Gold, triggers `+15 Claves` to the helper.
    * **Retention Policy:** Solved questions are **Permanent**. Unsolved questions with 0 replies auto-delete after 30 days.

### 2.4 Taxonomy
* **Mandatory Tags:** Users must select at least one tag (e.g., `#On2`, `#Spinning`, `#Musicality`) to post.
* **Search:** Global search bar queries Titles and Tags across both modes.

---

## 3. 💾 Content Management (Storage & Cleanup)
*A "Slot System" to manage storage costs and encourage curation.*

### 3.1 The "Active Slot" Limit
* **Base Users:** 5 Active Video Slots.
* **Pro Users:** 20 Active Video Slots.
* **Logic:** If `User_Video_Count >= Slot_Limit`, user cannot upload.
    * **Prompt:** "You have reached your 5 video limit. Delete an old video to post a new one."
    * **Exception:** Videos marked as "Accepted Solutions" in The Lab do *not* count toward the slot limit (they are Community Assets).

### 3.2 Technical Constraints
* **Max Duration:** 60 Seconds (Base) / 3 Minutes (Pro).
* **Max Resolution:** 720p (Base) / 1080p (Pro).

---

## 4. 👤 Profiles & Gamification
*Public profiles to drive social comparison and retention.*

### 4.1 Public User Profile
* **Header:** Profile Pic + Current Level (e.g., "Level 12 Mambo Soldier").
* **Social:** Link to Instagram (if connected).
* **Stats Card:** "Questions Solved" (Count), "Fires Received" (Count), "Current Streak" (Days).
* **The Trophy Case:** Grid view of earned Badges (Greyed out if not earned).

### 4.2 Badge System (The Hall of Fame)
* **Course Badges:**
    * **The Metronome:** Completed 7 drills in 7 days.
    * **The Lion:** Completed "Advanced Mastery" Course.
* **Community Badges:**
    * **El Maestro:** 10 Answers marked as "Solution."
    * **The Eye:** Reacted 100 times.
    * **First Responder:** Answered 5 questions <1 hour.
* **Performance Badges:**
    * **Firestarter:** Received 100 "Fire" reactions total.
    * **The Cinematographer:** Posted 10 High-Res videos.

---

## 5. 💎 Subscription Tiers (Monthly Only)
*Clear separation of Content (Base) vs. Tools (Mastery).*

### 5.1 Base Plan (€30 / month)
* **Course:** Full Access to all Lessons, Drills, and Choreographies.
* **Community:** Full Read/Write access (5 Slot Limit).
* **Economy:** Standard Earnings.

### 5.2 Pro Mastery Plan (€50 / month)
* **Includes Base + The following 6 Premium Features:**

1.  **The Practice Playlist Builder:**
    * User selects multiple videos (Warmup -> Drill -> Cooldown) to create a custom "Routine."
    * "Gapless Playback" auto-advances through the list.
2.  **The DJ Booth:**
    * Audio-only player for background practice.
    * Content: Percussion loops, full tracks with counting voiceover.
    * Background Audio enabled (persists on lock screen).
3.  **The Smart Looper:**
    * `[ 🔁 Loop Drill ]` button on video player.
    * Automatically loops the "Drill" section of a lesson (ignoring intro/outro timestamps).
4.  **The Legends Vault:**
    * Exclusive access to long-form Guest Workshops and Interviews.
5.  **Precision Player:**
    * Frame-by-frame seeking controls (`< >`) for detailed analysis when paused.
6.  **Visual Status & Economy:**
    * **Gold Profile Border** in comments.
    * **Storage:** 20 Video Slots / 3 Min Limit.
    * **Income:** Higher daily Clave roll (4-8).

---

## 6. 🛠️ Technical Requirements (For The Agent)

### 6.1 Database Schema (Logic Only)
* **`users`**: `id`, `email`, `is_pro`, `reputation`, `current_claves`
* **`posts`**: `id`, `type` ('stage'|'lab'), `video_mux_id`, `tags` (array), `feedback_type` ('hype'|'coach'), `is_wip` (bool)
* **`comments`**: `id`, `post_id`, `is_accepted_answer` (bool), `video_reply_mux_id`
* **`transactions`**: `id`, `user_id`, `amount` (+/-), `reason`, `created_at`
* **`user_badges`**: `user_id`, `badge_id`, `earned_at`

### 6.2 Mux Integration Rules
* **Direct Uploads:** Use Mux "Direct Upload" API.
* **Pre-Upload Check:** API must check `SELECT count(*) FROM posts WHERE user_id = X` against `Slot_Limit`. If limit reached, reject upload request.

### 6.3 Frontend Logic
* **Optimistic UI:** Update Wallet UI immediately upon action click. Revert if API fails.
* **"WIP" Banner:** CSS overlay on video component if `is_wip == true`.
* **Comment Guard:** If post `feedback_type == 'hype'`, hide the "Add Comment" input field entirely.

---
**End of Requirements.**