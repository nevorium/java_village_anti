# Java Village

A multiplayer farming game with pixelated 3D graphics, AI NPCs, and MMO-style features.

## Tech Stack

- **Frontend**: Next.js 14, React Three Fiber, Drei
- **Backend**: Supabase (Auth, Database, Realtime)
- **AI**: Gemini API / OpenRouter
- **TTS**: Self-hosted VITS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase CLI (optional, for local dev)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your keys

# Run development server
pnpm dev
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Enable authentication providers:
   - Email/Password (enabled by default)
   - Google: Authentication > Providers > Google
   - Discord: Authentication > Providers > Discord
   - Facebook: Authentication > Providers > Facebook
4. Copy your project URL and anon key to `.env.local`

## Project Structure

```
java_village/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── database/         # Supabase schema & types
│   ├── game-logic/       # Shared game logic
│   └── assets/           # Asset management
├── supabase/
│   └── migrations/       # Database migrations
└── scripts/              # Utility scripts
```

## Development

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm lint       # Run linter
pnpm test       # Run tests
```
