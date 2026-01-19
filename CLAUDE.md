# HedgeFront Development Guidelines

## 1. Safety & Security
- **NEVER** hardcode secrets (API keys, DB passwords, OAuth tokens). Always use `process.env` or `os.getenv`.
- If a `.env` variable is missing, ask the user to add it; do not default to a dummy value in production code.
- **Always** verify the database connection before running migrations.

## 2. The "Test-First" Protocol
- **Before** marking a task as complete, you must run a verification test.
- For Backend: Write a `pytest` case for every new endpoint.
- For Frontend: Use `playwright` to verify the UI component renders and interacts correctly.
- Do not proceed to the next phase if the current tests are failing.

## 3. Tech Stack Specifics
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion.
- **Charts:** Use `lightweight-charts` for market data (candles) and `recharts` for portfolio history.
- **Backend:** FastAPI, SQLAlchemy (Async), Pydantic v2.
- **Styling:** Use `shadcn/ui` components as the base, but customize them with `framer-motion` for transitions.

## 4. Animation & UX Guidelines
- **Page Transitions:** Use `framer-motion` `AnimatePresence` for route changes.
- **Real-time Data:** When a price updates, flash the cell green/red. Use CSS animations for this (performance), not React state re-renders if possible.
- **Candlesticks:** Ensure the chart is responsive and handles resize events.


## 5. Context Management (Token Saving)
- **Do not** recursively scan directories or read file contents unless explicitly asked.
- When starting a session, rely on `plan.md` status checkboxes as the source of truth.
- If you need to see the project structure, run `ls -R` or `tree` first. Do not use `Explore` tool blindly.