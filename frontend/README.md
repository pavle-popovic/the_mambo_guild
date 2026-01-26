# Frontend - The Mambo Inn LMS

Next.js 15 frontend application for The Mambo Inn Learning Management System.

## 🚀 Tech Stack

- **Next.js 15.1.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework with custom dark theme
- **Framer Motion 12.23.26**: Smooth animations and page transitions
- **React Icons**: Icon library
- **react-markdown**: Markdown rendering with GitHub Flavored Markdown support
- **@mux/mux-player-react**: Official Mux video player component
- **@mux/mux-uploader-react**: Official Mux video uploader component
- **Axios**: HTTP client for API communication
- **clsx & tailwind-merge**: Utility functions for className management

## 📦 Dependencies

See `package.json` for complete dependency list. Key packages:

- `next`: 15.1.5
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `react-markdown`: ^10.1.0
- `remark-gfm`: ^4.0.1
- `@mux/mux-player-react`: ^3.10.2
- `@mux/mux-uploader-react`: ^1.4.1
- `axios`: ^1.13.2
- `framer-motion`: ^12.23.26
- `react-icons`: ^5.5.0
- `clsx`: ^2.1.1
- `tailwind-merge`: ^3.4.0

## 🏗️ Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard
│   │   ├── builder/         # Course builder page
│   │   ├── students/        # Student management
│   │   └── settings/        # Admin settings
│   ├── courses/             # Course pages
│   │   ├── page.tsx         # Course listing
│   │   └── [id]/            # Course detail page
│   ├── lesson/              # Lesson viewing
│   │   └── [id]/            # Individual lesson page
│   ├── profile/             # User profile (with badge trophy case)
│   ├── pricing/             # Pricing/subscription
│   ├── community/           # Community feed (Stage & Lab)
│   ├── login/               # Login page (with Google OAuth)
│   ├── register/            # Registration page (with password confirmation)
│   ├── forgot-password/     # Password reset request page
│   ├── reset-password/      # Password reset page
│   └── auth/                # OAuth callback handler
│       └── callback/        # OAuth callback page
├── components/              # React components
│   ├── common/              # Reusable components
│   │   └── ImageUploader.tsx # R2 image upload component
│   ├── ui/                  # UI primitives
│   │   ├── motion.tsx       # Framer Motion animation components
│   │   ├── GlassCard.tsx    # Frosted glass card component
│   │   └── MagicButton.tsx  # Premium animated button component
│   ├── MuxUploader.tsx      # Mux video upload component
│   ├── MuxVideoPlayer.tsx   # Mux video player component
│   ├── AuthPromptModal.tsx  # Login/subscribe modals
│   ├── SuccessNotification.tsx # Completion animations
│   ├── NavBar.tsx           # Navigation bar with animations
│   ├── Footer.tsx           # Footer component
│   ├── QuestLogSidebar.tsx  # Lesson sidebar with Week/Day organization
│   ├── PalladiumMesh.tsx    # Dark mesh gradient background
│   ├── ClaveWallet.tsx      # Clave balance navbar component
│   ├── WalletModal.tsx      # Wallet details and transaction history
│   ├── CreatePostModal.tsx  # Community post creation modal
│   ├── BadgeTrophyCase.tsx  # Badge display component
│   └── ReferralSection.tsx  # Referral program UI
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions (cn for className merging)
└── public/                  # Static assets
    └── assets/             # Images, audio files
```

## 🎨 Key Features

### Components

**MuxUploader**: Handles video uploads to Mux
- Direct upload using `@mux/mux-uploader-react`
- Status tracking (uploading, processing, live, error)
- Automatic polling for video processing completion
- Delete video functionality

**MuxVideoPlayer**: Displays Mux videos
- Uses `@mux/mux-player-react` for playback
- Handles video completion tracking
- Custom styling with brand colors

**ImageUploader**: Direct image uploads to Cloudflare R2
- Presigned URL workflow
- Progress tracking
- Error handling
- Used for avatars, course thumbnails, lesson thumbnails

**AuthPromptModal**: Beautiful authentication prompts
- Login modal with register option
- Subscribe modal for locked content
- Gradient styling and smooth animations

**SuccessNotification**: Completion animations
- XP gained display
- Level-up notifications
- Audio feedback
- Auto-dismiss after 3 seconds

### Pages

**Admin Builder** (`/admin/builder`):
- Course creation and management
- **Content type selector**: Tag as Course (📚), Choreo (💃), or Topic (💡)
- Hierarchical curriculum builder (Week/Day/Lesson)
- Lesson editor with auto-save
- Thumbnail management
- Video upload integration

**Course Listing** (`/courses`):
- Browse all available courses, choreographies, and topics
- **Search bar**: Find content by name with aesthetic amber glow design
- **Type filters**: Filter by Courses (📚), Choreos (💃), Topics (💡) with count badges
- **Difficulty filters**: Filter by Beginner, Intermediate, Advanced
- Progress tracking
- Type-specific badges on cards (color-coded)
- Locked course indicators with "Become A Member" messaging
- Direct links to pricing page

**Course Detail** (`/courses/[id]`):
- Lesson list organized by Week/Day with proper ordering
- Progress indicators
- Lesson thumbnails
- Completion tracking
- Consistent ordering matching course builder

**Lesson Page** (`/lesson/[id]`):
- Video player (Mux)
- Markdown content rendering
- Interactive quizzes
- Discussion section
- Completion tracking
- QuestLogSidebar with Week/Day sections matching course structure
- Next/previous lesson navigation based on proper ordering

**Profile Page** (`/profile`):
- User information display with Gamertag (Username)
- **Edit Username**: Built-in tool to update handle
- Profile picture upload (hover overlay)
- Level and XP display
- Progress tracking
- Badge Trophy Case with earned/locked badges
- Referral section with link sharing

**Public Profile** (`/u/[username]`):
- Publicly accessible view of user stats
- Display of earned badges and level
- Streak count and reputation visualization
- "Copy Link" feature for sharing

**Community Page** (`/community`):
- Dual-mode feed: The Stage (video posts) and The Lab (Q&A)
- Tag filtering system
- Create Post Modal with video upload (Stage) or text (Lab)
- Post reactions (Fire, Ruler, Clap)
- Solution marking for Lab questions
- WIP (Work in Progress) toggle for Stage posts
- Feedback type selection (Hype Only vs Coaching Allowed)

## 🔧 Development

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Key Configuration

**next.config.ts**:
- Remote image patterns for R2, Mux, and Google domains
- Image optimization settings
- Configured domains:
  - `pub-bad1fce3595144f2bac8492efa3aec64.r2.dev` (Cloudflare R2)
  - `image.mux.com` (Mux thumbnails)
  - `lh3.googleusercontent.com` (Google profile pictures)

## 🎯 Key Features Implementation

### Auto-Save
The lesson editor implements debounced auto-save:
- 2-second debounce delay
- Prevents unnecessary API calls
- Preserves user edits during save operations
- Visual "Saving..." indicator

### State Management
- React Context for authentication
- Local state for component-specific data
- Optimized re-renders with proper dependency arrays
- State updates without page refreshes

### Image Handling
- Next.js Image component for optimization
- Remote pattern configuration for external domains
- Fallback handling (R2 thumbnail → Mux thumbnail → gradient)
- Circular cropping for avatars

### Video Handling
- Mux SDK integration
- Webhook-based status updates
- Polling for processing completion
- Error handling and retry logic

## 📱 Responsive Design

The application is fully responsive:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions
- Adaptive layouts

## 🎨 Styling & Animations

- Tailwind CSS utility classes with custom dark theme
- Custom color palette (mambo-blue, mambo-gold, mambo-panel, etc.)
- Dark mode throughout with club-like studio aesthetic
- Editorial-style typography with improved spacing
- Framer Motion animations:
  - Page transitions (fade in/out) with hydration-safe implementation
  - Hover effects on cards and buttons
  - Stagger animations for lists
  - Interactive button feedback
- Glass/neon effects on buttons and cards
- Gradient backgrounds and shadows
- Smooth transitions throughout
- Server-side rendering compatibility (no hydration mismatches)

## 🔐 Authentication

### Login Methods
- **Email/Password**: Traditional login form
- **Google OAuth**: One-click sign-in with Google account
  - Redirects to Google consent screen
  - Handles callback and stores JWT token
  - Automatic account creation

### Registration
- Email/password registration
- Password confirmation validation
- Client-side password strength validation (minimum 8 characters)
- Automatic login after successful registration

### Password Reset
- Forgot password page to request reset email
- Reset password page with token validation
- Password confirmation required
- Secure token-based flow

### Session Management
- JWT token storage in localStorage
- Automatic token refresh
- Protected routes
- Role-based access (admin/user)
- Extended session duration (7 days)
- OAuth callback handling with Suspense boundary

## 🚀 Performance Optimizations

- **Parallel API Calls**: Lesson page fetches all course lessons simultaneously (reduces load time from ~1000ms to ~200ms for 5 courses)
- **Request Caching**: API client caches GET requests for 30 seconds to reduce redundant calls
- **Memoization**: QuestLogSidebar uses `useMemo` to cache sorting and grouping calculations
- Next.js Image optimization
- Code splitting
- Lazy loading
- Debounced auto-save
- Efficient state updates
- Minimal re-renders

## 📝 Recent Updates

### Latest Features
- ✅ **PalladiumMesh Background** (January 2026)
  - Dark monochrome mesh gradient background component
  - 5 animated blurred circles with Framer Motion
  - 90% black base with 10% subtle mesh elements
  - Global background (excludes home page video)
  - Performance optimized with GPU acceleration
- ✅ **Community Features v4.0** (January 2026)
  - **Community Page**: Dual-mode feed (The Stage & The Lab)
  - **Create Post Modal**: Full-featured post creation with video upload, tags, WIP toggle, feedback types
  - **Clave Wallet**: Navbar balance display with wallet modal
  - **Badge Trophy Case**: Profile page badge display component
  - **Referral Section**: Referral link generation UI
  - **Post Cards**: StagePostCard and LabPostCard components
  - **Reaction System**: Fire, Ruler, Clap reactions with visual feedback
- ✅ **Content Type System**: Courses, Choreographies, and Topics
  - Type selector in admin course builder (📚 Course, 💃 Choreo, 💡 Topic)
  - Type-specific colored badges on course cards
  - Aesthetic search bar with amber glow effect
  - Type filter buttons with count badges
  - Combined filtering (type + difficulty + search)
- ✅ **Course Completion System**: Beautiful course completion celebration
  - CourseCompletionModal component with trophy icon and congratulations
  - Automatic detection when all lessons in a course are completed
  - Shows completion modal instead of regular lesson success when course is done
  - Direct navigation to courses page from completion modal
  - "Complete" badge on course cards when progress reaches 100%
  - Progress bar shows 100% when course is complete
- ✅ **Progress Bar Visual Fix**: Green gradient progress bar in quest sidebar
  - Fixed progress bar not showing visual fill (was transparent)
  - Now displays vibrant green gradient (emerald-500 to emerald-600)
  - Proper width calculation using worldProgress prop
  - Smooth transitions and visual feedback
- ✅ **Progress Bar Calculation**: Improved accuracy and edge case handling
  - Fixed division by zero errors
  - Progress clamped to valid 0-100% range
  - Handles empty lesson lists gracefully
  - Uses worldProgress prop for accurate tracking
- ✅ **Quest Bar Auto-Scroll**: Enhanced user experience
  - Auto-scrolls to current lesson on page load
  - Scrolls to current lesson after completion
  - Current lesson positioned at top of quest bar
  - Smooth scrolling with retry logic for reliability
- ✅ **Course Preview Videos**: Smooth hover preview experience
  - Upload preview videos via admin course builder
  - Automatic playback on card hover
  - Smooth fade transitions between thumbnail and video
  - Video restarts on each hover for consistent experience
  - Hidden controls for clean preview playback
  - Error handling with graceful fallback to thumbnails
  - Full Mux integration with asset management
- ✅ **Enhanced Course Cards**: Improved user experience
  - Thumbnail always visible as base layer
  - Video overlays smoothly on hover
  - No layout shift or dark flash
  - Consistent behavior on repeated hovers
- ✅ **Stripe Payment Integration**: Complete payment flow
  - Pricing page with Euro currency support
  - Checkout session creation
  - Login prompts for unauthenticated users
  - Subscription tier management
- ✅ **Course Preview Uploader Component**: Full-featured upload interface
  - Sync with Mux on mount
  - Polling for video readiness
  - Delete functionality with Mux sync
  - Status indicators (idle, uploading, processing, live, deleting)
