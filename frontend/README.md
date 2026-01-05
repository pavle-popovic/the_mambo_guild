# The Mambo Inn - Frontend

Next.js frontend application for The Mambo Inn LMS platform.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (via fetch API)
- **@mux/mux-player-react** - Video playback
- **react-markdown** - Markdown rendering
- **React Icons** (for icons)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`
- PostgreSQL and Redis running (via docker-compose)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/           # Registration page
│   ├── courses/           # Courses listing
│   ├── lesson/[id]/       # Lesson player
│   ├── profile/           # User profile
│   ├── pricing/           # Pricing page
│   └── admin/             # Admin pages
├── components/            # Reusable React components
│   ├── NavBar.tsx
│   ├── Footer.tsx
│   ├── GlobalAudioPlayer.tsx
│   ├── QuestLogSidebar.tsx
│   ├── AdminSidebar.tsx
│   ├── LessonEditorModal.tsx  # Admin lesson editor with auto-save
│   ├── MuxUploader.tsx        # Video upload component
│   ├── MuxVideoPlayer.tsx     # Video player component
│   └── MarkdownRenderer.tsx   # Markdown content renderer
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state
├── lib/                   # Utility functions
│   └── api.ts             # API client
└── public/               # Static assets
    └── assets/            # Images, videos, audio
```

## Features

### Authentication
- User registration with level selection
- Login with JWT tokens
- Persistent sessions via localStorage
- Protected routes

### Course System
- World-based course structure
- Lesson progression with locking
- Video player integration
- XP rewards on completion with animated success notifications
- Progress tracking
- Engaging completion animations with audio feedback

### Gamification
- XP system with level calculation
- Streak tracking
- Badge system (UI ready)
- Leaderboard (UI ready)

### Admin Features
- Dashboard with statistics
- Course builder with **Week/Day hierarchy** matching student view
- Hierarchical curriculum management (Add/Remove Weeks, Days, Lessons)
- Lesson editor with **auto-save** (real-time sync)
- Video upload and management (Mux integration)
- Rich content creation (Markdown, quizzes)
- Context-aware lesson creation (Week/Day auto-assigned)
- Grading queue for boss battles
- Student management
- Settings page

### Video Features
- Video upload via Mux from admin interface
- HLS streaming with adaptive bitrate
- Real-time upload and processing status
- Video management (upload, delete)

### Recent Updates
- **Auto-Save**: Lesson editor auto-saves after 2 seconds of inactivity
- **Real-time Sync**: Changes in editor automatically sync to database
- **Music Control**: Background music disabled on lesson pages
- **Extended Sessions**: JWT tokens expire after 7 days (persistent login)
- **Markdown Support**: Rich markdown rendering in lesson content

## API Integration

All API calls are handled through `lib/api.ts`. The API client:
- Automatically includes JWT tokens
- Handles errors gracefully
- Stores tokens in localStorage

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Building for Production

```bash
npm run build
npm start
```

## Testing

See `test_frontend.md` for comprehensive testing guide.
