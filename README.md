# LLM Powered Chat Platform

A modern conversational UI built with React, TypeScript, and Vite. The experience delivers Gemini-powered responses with optimistic updates, streaming partial completions, and a responsive layout that adapts from desktop workspaces to mobile hand-offs.

## Highlights
- **Threaded conversations** with create/delete/clear controls, automatic titling, and localStorage persistence via `useThreadsManager`.
- **SSE streaming pipeline** that buffers Gemini deltas, renders partial answers in real time, and gracefully recovers from aborts or backend failures.
- **User onboarding modal** to capture and persist a friendly display name before starting a conversation.
- **Responsive sidebar** that collapses on smaller viewports, supports overlay mode, and locks background scroll while open.
- **Animation system** powered by Framer Motion and shared easing utilities for smooth panel transitions, typing indicators, and hero prompts.
- **Markdown-ready messages** using `react-markdown`, styled "hero" empty state, and an inline error banner with retry controls.
- **SEO & metadata polish** through descriptive `<meta>` tags, keywords, and favicon wiring in `index.html`.

## Tech Stack
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind-inspired utility classes (`index.css`) with custom theming
- **Animations**: Framer Motion 12
- **Icons & Markdown**: `react-icons`, `react-markdown`
- **Data persistence**: `localStorage` (threads, username)

## Project Structure
```text
src/
|-- App.tsx                      # Root layout: sidebar + chat surface + onboarding modal
|-- main.tsx                     # Vite entry point
|-- index.css                    # Global theme tokens and utility classes
|-- types.ts                     # Shared domain types (threads, messages, prompts)
|-- features/
|   |-- chat/
|   |   |-- components/
|   |   |   |-- ChatExperience.tsx   # Orchestrates header, message list, composer
|   |   |   |-- ChatHeader.tsx       # Conversation title + clear controls
|   |   |   |-- ChatHero.tsx         # Empty-state hero with suggested prompts
|   |   |   |-- ChatMessageList.tsx  # Animated list with markdown rendering
|   |   |   |-- ChatComposer.tsx     # Input field, send/stop buttons, error banner
|   |   |   `-- ChatErrorBanner.tsx  # Inline retry + pending question surface
|   |   |-- hooks/
|   |   |   `-- useChatInteractions.ts  # Handles input state, SSE streaming, retries
|   |   `-- constants/
|   |       `-- prompts.ts           # Suggested prompt definitions
|   |-- threads/
|   |   |-- components/
|   |   |   |-- ThreadSidebar.tsx    # Thread list UI, create/delete/clear actions
|   |   |   `-- ThreadItem.tsx       # Individual thread card with metadata
|   |   `-- hooks/
|   |       |-- useThreadsManager.ts # Thread state, persistence, optimistic updates
|   |       `-- useSidebarState.ts   # Responsive drawer + collapse logic
|   `-- user/
|       |-- components/
|       |   `-- UserOnboardingModal.tsx  # Collects username before chatting
|       `-- hooks/
|           `-- useUsername.ts           # localStorage-backed username manager
`-- shared/
    |-- animation/
    |   `-- easings.ts                # Reusable ease curves for motion variants
    |-- components/
    |   `-- Modal.tsx                 # Generic modal shell used by onboarding
    |-- hooks/
    |   `-- useScrollLock.ts          # Prevent background scroll on mobile drawers
    `-- utils/
        `-- ids.ts                    # Lightweight random ID helper
```

## Getting Started
### Prerequisites
- Node.js 18+
- pnpm 9+ (recommended for dependency resolution)

### Installation
```bash
pnpm install
```

### Environment Configuration
The chat client targets a hosted Gemini proxy by default (`https://ai-power-chat-platform-backend.onrender.com/gemini`).

You can override the API host via `.env`:

```bash
# .env or .env.local
VITE_GEMINI_API_URL=https://your-backend.example.com/gemini
```

> The code will append `/gemini` if the value does not already end in it. During development you can point to a local server (for example, an Express proxy) to avoid cross-origin limitations.

### Run the App
```bash
pnpm dev
```
Open http://localhost:5173 in your browser. The UI automatically adapts to viewport size and retains threads and username between sessions.

### Additional Scripts
| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `pnpm build`   | Type-check (`tsc -b`) and generate production build   |
| `pnpm preview` | Preview the production build locally                  |
| `pnpm lint`    | Run ESLint across the project                         |

## Key Concepts
- **Optimistic messaging**: User prompts are inserted immediately; assistant replies stream into a placeholder message and are removed if the request fails.
- **Error recovery**: HTML or text errors from the backend produce a friendly banner, restore the user input, and enable quick retry.
- **Scroll management**: `useScrollLock` prevents background scroll when the mobile sidebar is open; the message list auto-scrolls to the latest message.
- **Automatic titles**: New threads derive their title from the first prompt (capped at 48 characters) and update `updatedAt` ordering for sorting.

