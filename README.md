# Brim — an AI-powered browser IDE

Brim is a browser-based IDE featuring real-time collaborative code editing, AI-powered code suggestions, an AI conversation assistant, in-browser code execution, and GitHub import/export.

## Features

- Real-time collaborative code editing
- AI-powered code suggestions and quick edit (Cmd+K)
- Conversation-based AI assistant
- In-browser code execution with WebContainer
- GitHub import/export integration
- Multi-file project management

## Tech Stack

| Category      | Technologies                                                 |
| ------------- | ------------------------------------------------------------ |
| **Frontend**  | Next.js 16, React 19, TypeScript, Tailwind CSS 4              |
| **Editor**    | CodeMirror 6, Custom Extensions, One Dark Theme                |
| **Backend**   | Convex (Real-time DB), Inngest (Background Jobs)                |
| **AI**        | Claude Sonnet 4 (preferred) or Gemini 2.0 Flash (free tier)      |
| **Execution** | WebContainer API, xterm.js                                        |
| **UI**        | shadcn/ui, Radix UI                                                 |

## Getting Started

### Prerequisites

- Node.js 20.09+
- npm or pnpm
- Accounts needed:
  - [Convex](https://convex.dev) - Database
  - [Inngest](https://inngest.com) - Background jobs
  - [Anthropic](https://anthropic.com) or [Google AI Studio](https://aistudio.google.com) - AI API (one required)
  - [Firecrawl](https://firecrawl.dev) - Web scraping (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/whynotramaa/brim.git
   cd brim
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` with the required keys:

   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=
   CONVEX_DEPLOYMENT=
   BRIM_CONVEX_INTERNAL_KEY=  # Generate a random string

   # AI Provider (choose one)
   ANTHROPIC_API_KEY=             # Preferred - Claude Sonnet 4
   GOOGLE_GENERATIVE_AI_API_KEY=  # Free alternative - Gemini 2.0 Flash

   # Firecrawl (optional)
   FIRECRAWL_API_KEY=
   ```

5. Start the Convex development server:

   ```bash
   npx convex dev
   ```

6. In a new terminal, start the Next.js development server:

   ```bash
   npm run dev
   ```

7. In another terminal, start the Inngest dev server:

   ```bash
   npx inngest-cli@latest dev
   ```

8. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── messages/      # Conversation API
│   │   ├── suggestion/    # AI suggestions
│   │   └── quick-edit/    # Cmd+K editing
│   └── projects/          # Project pages
├── components/            # Shared components
│   ├── ui/               # shadcn/ui components
│   └── ai-elements/      # AI conversation components
├── features/
│   ├── auth/             # Authentication
│   ├── conversations/    # AI chat system
│   ├── editor/           # CodeMirror setup
│   │   └── extensions/   # Custom extensions
│   ├── preview/          # WebContainer
│   └── projects/         # Project management
├── inngest/              # Inngest client
└── lib/                  # Utilities

convex/
├── schema.ts             # Database schema
├── projects.ts           # Project queries/mutations
├── files.ts              # File operations
├── conversations.ts      # Conversation operations
└── system.ts             # Internal API for Inngest
```

## Editor

- Syntax highlighting for JS, TS, CSS, HTML, JSON, Markdown, Python
- Line numbers and code folding
- Minimap overview
- Bracket matching and indentation guides
- Multi-cursor editing

## AI Features

- Real-time code suggestions with ghost text
- Quick edit with Cmd+K (select code + natural language instruction)
- Selection tooltip for quick actions
- Conversation sidebar with message history

## File Management

- File explorer with folder hierarchy
- Create, rename, delete files and folders
- VSCode-style file icons
- Tab-based file navigation
- Auto-save with debouncing

## Real-time

- Convex-powered instant updates
- Optimistic UI updates
- Background job processing with Inngest

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Acknowledgments

- [Cursor](https://cursor.sh) - Inspiration for the project
- [Orchids](https://orchids.app) - Inspiration for the project
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [CodeMirror](https://codemirror.net) - Code editor
