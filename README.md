# Togyzqumalaq Digital

**AI-powered digitization platform for togyzqumalaq tournament scoresheets**

Togyzqumalaq Digital converts handwritten and printed tournament scoresheets into standardized FEN notation using AI OCR, enabling game archival, replay, and analysis.

**Live demo:** [togyzqumalaq-digital.vercel.app](https://togyzqumalaq-digital.vercel.app)

## What is Togyzqumalaq?

Togyzqumalaq (Kazakh: Tоғызқұмалақ) is an ancient Central Asian strategy board game played on a board with 18 pits and 162 stones. It is recognized as part of Kazakhstan's intangible cultural heritage and is played competitively across 15+ countries.

## The Problem

Tournament arbiters manually process hundreds of paper scoresheets. Sheets get lost, handwriting is hard to read, and there is no standardized digital format for game records. This makes game analysis, archival, and sharing extremely difficult.

## The Solution

1. **Upload** a photo of a tournament scoresheet
2. **AI OCR** extracts moves automatically via DeepSeek (Alem.Plus LLM API)
3. **Review & correct** recognized moves with side-by-side original image
4. **Generate FEN** — standardized notation for every position
5. **Archive, replay, export** — search games, step through moves on a visual board, export as FEN/JSON

## Key Features

- **AI OCR Recognition** — Extract moves from scoresheet photos via Alem.Plus LLM API
- **Manual Move Entry** — Step-by-step input with real-time board visualization and rule validation
- **Game Engine** — Full togyzqumalaq rules (sowing, capture, tuzdik) ported from PlayStrategy (Scala)
- **FEN Generation** — Standardized position notation compatible with PlayStrategy format
- **Game Archive** — Personal archive with search, filters (date, opponent, result, tournament)
- **Board Visualization** — Interactive board with blue/wood themes and move navigation
- **Export** — FEN (TXT), JSON formats
- **Multilingual** — Kazakh (kk), Russian (ru), English (en)
- **Dark/Light Mode** — Persistent theme selection
- **Responsive** — Mobile-first design with Mantine UI

## Alem.Plus Integrations

| # | Service | Purpose |
|---|---------|---------|
| 1 | **Supabase (Alem.Plus Dedicated)** | PostgreSQL database, Auth, Storage, Realtime |
| 2 | **LLM API (llm.alem.ai)** | DeepSeek OCR for scoresheet recognition |
| 3 | **LLM API (llm.alem.ai)** | AI-powered move validation and structuring |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, Mantine UI 7, Tabler Icons |
| Backend | Next.js Server Actions |
| Database | Supabase PostgreSQL (Alem.Plus dedicated instance) |
| Auth | Supabase Auth (email/password) |
| AI/OCR | DeepSeek OCR via Alem.Plus LLM API (llm.alem.ai) |
| Game Engine | TypeScript (ported from Scala PlayStrategy/strategygames) |
| Validation | Zod schemas |
| i18n | next-intl (kk/ru/en) |
| Testing | Vitest (unit), Playwright (E2E) |
| Deploy | Vercel (auto-deploy on push) |

## Project Structure

```
togyzqumalaq-digital/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── upload/         # Scoresheet upload + OCR
│   │   │   ├── manual/         # Manual move entry
│   │   │   ├── archive/        # Game archive + search
│   │   │   ├── game/[id]/      # Game replay viewer
│   │   │   └── profile/        # User profile
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── board/              # Board visualization (board, pit, controls)
│   │   ├── ocr/                # OCR components (upload, progress, results)
│   │   ├── game/               # Game components (FEN display, move input/list)
│   │   └── ui/                 # Shared UI (app shell, language switch)
│   ├── lib/
│   │   ├── game-engine/        # Togyzqumalaq rules engine
│   │   │   ├── engine.ts       # Move execution, captures, tuzdik
│   │   │   ├── fen.ts          # FEN parsing/generation
│   │   │   ├── board.ts        # Board state (immutable)
│   │   │   ├── pos.ts          # Position mapping (18 pits)
│   │   │   └── types.ts        # Type definitions
│   │   ├── ocr/                # DeepSeek OCR client
│   │   ├── supabase/           # Supabase clients (browser/server)
│   │   └── i18n/               # Internationalization
│   ├── actions/                # Server Actions (auth, games, OCR, upload)
│   └── schemas/                # Zod validation schemas
├── supabase/
│   ├── migrations/             # SQL schema + RLS policies
│   └── functions/              # Edge Functions (OCR processing)
├── public/
│   ├── board/                  # Board assets (blue/wood themes)
│   └── locales/                # Translation files (kk, ru, en)
└── tests/
    ├── unit/                   # Vitest unit tests
    └── e2e/                    # Playwright E2E tests
```

## Game Engine

The game engine is a TypeScript port of the [PlayStrategy/strategygames](https://github.com/Mind-Sports-Games/strategygames) Scala implementation.

**Rules implemented:**
- 18 pits (9 per side) + 2 kazans (score pits)
- 162 stones total (invariant)
- Counter-clockwise sowing with correct stone distribution
- Capture rule: even stone count in opponent's pit after landing
- Tuzdik rule: exactly 3 stones, not pit 9, one per player, not symmetric
- Game-over: 82+ stones to win, 81-81 = draw, remaining stones redistributed
- FEN format: `9S,9S,.../9S,9S,... scoreSouth scoreNorth side moveNumber`

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
git clone https://github.com/Baktiyar88/togyzqumalaq-digital.git
cd togyzqumalaq-digital
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `DEEPSEEK_OCR_URL` — OCR API endpoint (default: https://llm.alem.ai/v1/chat/completions)
- `DEEPSEEK_OCR_API_KEY` — Alem.Plus LLM API key

### Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run lint         # ESLint
```

### Database Setup

Apply migrations to your Supabase instance:

```bash
# Via Supabase CLI
supabase db push

# Or manually run SQL files in order:
# supabase/migrations/001_initial.sql
# supabase/migrations/002_rls.sql
```

## FEN Format

Adapted Forsyth-Edwards Notation for togyzqumalaq:

```
9S,9S,9S,9S,9S,9S,9S,9S,9S/9S,9S,9S,9S,9S,9S,9S,9S,9S 0 0 S 1
│                            │                            │ │ │ │
│  South pits (A1-I1)       │  North pits (I2-A2)       │ │ │ └─ Move number
│                            │                            │ │ └─── Side (S/N)
│                            │                            │ └───── North score
│                            │                            └─────── South score
```

- `9S` = 9 stones (S suffix for stone pieces)
- `t` = tuzdik marker (pit captured permanently)
- Total stones across all pits + scores = 162

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, club, rating, role, locale) |
| `tournaments` | Tournament metadata |
| `games` | Game records (players, result, source type) |
| `moves` | Individual moves with FEN after each move |
| `ocr_jobs` | OCR processing jobs with status tracking |

Row Level Security (RLS) enabled on all tables.

## API / Server Actions

| Action | Purpose |
|--------|---------|
| `serverLogin` / `serverRegister` | Authentication |
| `createGame` | Create new game record |
| `saveMoves` | Validate and save moves via game engine |
| `searchGames` | Search archive with filters |
| `exportGameFen` / `exportGameJson` | Export game data |
| `uploadScoresheet` | Upload scoresheet image |
| `triggerOCR` | Run AI OCR on uploaded image |

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 10 OCR/month, manual entry, basic archive |
| Pro | $5/month | Unlimited OCR, PDF export, priority processing |
| Enterprise | $50/month | Batch upload, API access, federation dashboard |

## Roadmap

- **MVP** (current) — Auth, upload, OCR, manual entry, FEN, basic archive
- **v1.0** — Second OCR model, batch upload, PDF export, PWA
- **v1.5** — Tournament module, game comments, public archive
- **v2.0** — Public API, game analytics, mobile app

## Team

Developed for **Decentrathon 5.0** hackathon (Alem.Plus track).

## License

MIT
