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
│   ├── profile/             # User profile
│   ├── pricing/             # Pricing/subscription
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React components
│   ├── common/              # Reusable components
│   │   └── ImageUploader.tsx # R2 image upload component
│   ├── ui/                  # UI primitives
│   │   └── motion.tsx       # Framer Motion animation components
│   ├── MuxUploader.tsx      # Mux video upload component
│   ├── MuxVideoPlayer.tsx   # Mux video player component
│   ├── AuthPromptModal.tsx  # Login/subscribe modals
│   ├── SuccessNotification.tsx # Completion animations
│   ├── NavBar.tsx           # Navigation bar with animations
│   ├── Footer.tsx           # Footer component
│   └── QuestLogSidebar.tsx  # Lesson sidebar with Week/Day organization
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
- Hierarchical curriculum builder (Week/Day/Lesson)
- Lesson editor with auto-save
- Thumbnail management
- Video upload integration

**Course Listing** (`/courses`):
- Browse all available courses
- Progress tracking
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
- User information display
- Profile picture upload (hover overlay)
- Level and XP display
- Progress tracking

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
- Remote image patterns for R2 and Mux domains
- Image optimization settings

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

- JWT token storage in localStorage
- Automatic token refresh
- Protected routes
- Role-based access (admin/user)
- Extended session duration (7 days)

## 🚀 Performance Optimizations

- Next.js Image optimization
- Code splitting
- Lazy loading
- Debounced auto-save
- Efficient state updates
- Minimal re-renders
