# Landing Page Animation V1 Archive

**Archived on:** 2026-01-21

This folder contains the complete "Hero Scroll Animation" and associated landing page components from Version 1 of the Salsa Lab application.

## Contents

- **`components/landing/`**: The React components for the landing page, including:
  - `HeroScrollAnimation.tsx`: The core scroll-based frame animation.
  - `HeroOverlayEffects.tsx`: Overlay visual effects.
  - `Mambobot.tsx`: The animated robot component.
  - Other sections (`CourseExplorerSection`, `MaestroSection`, etc.).

- **`assets/hero-frames/`**: The sequence of 192 JPG frames used for the scroll animation.

- **`page_reference.tsx`**: A copy of the `frontend/app/page.tsx` file showing how the `HeroScrollAnimation` and other sections were composed.

## How to Restore

To reuse this animation in the codebase:

1.  **Copy Components**:
    Copy the `components/landing` folder back to `frontend/components/landing`.

2.  **Copy Assets**:
    Copy the `assets/hero-frames` folder back to `frontend/public/assets/hero-frames`.

3.  **Dependencies**:
    Ensure the following dependencies are installed:
    - `framer-motion` (`npm install framer-motion`)
    - `@/components/ui/motion` (specifically the `Clickable` component used in `HeroScrollAnimation.tsx`).

4.  **Usage**:
    Import and use the component as shown in `page_reference.tsx`:
    ```tsx
    import { HeroScrollAnimation } from "@/components/landing";

    // ... inside your page component
    <HeroScrollAnimation user={user} />
    ```
