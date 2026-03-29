# Next.js 16 + PayloadCMS + shadcn Starter Kit

Server-first Next.js 16 project with PayloadCMS backend, shadcn/ui components, and built-in authentication.

## Stack

- **Next.js 16** (React 19) - App Router, React Server Components
- **PayloadCMS 3** - Headless CMS with MongoDB
- **shadcn/ui** - New York style, Tailwind CSS v4
- **TypeScript 5.7** - Strict mode enabled
- **Vercel AI SDK 6** - AI elements registry

## Features

- Cookie-based authentication with protected routes
- Dark mode with `next-themes`
- RTL support with `DirectionProvider`
- Toast notifications with `sonner`
- Vercel Blob media storage
- Lexical rich text editor
- Agentation webhook integration

## Quick Start

```bash
git clone <repo-url> my-project
cd my-project
cp .env.example .env

# Configure .env:
# DATABASE_URL=mongodb://...
# PAYLOAD_SECRET=your-secret
# BLOB_READ_WRITE_TOKEN=your-token (optional, for Vercel Blob)

bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and follow on-screen instructions to create your admin user.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/               # Public pages (RSC)
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Frontend layout
│   │   ├── styles.css            # Frontend styles
│   │   ├── login/                # Login page + server actions
│   │   │   ├── page.tsx          # Redirects if already authenticated
│   │   │   ├── login-form.tsx    # Client form component
│   │   │   └── actions.ts        # login, logout, getCurrentUser
│   │   └── (protected)/          # Auth-required route group
│   │       └── dashboard/page.tsx
│   ├── (payload)/                # Admin panel + API (auto-generated)
│   │   ├── admin/[[...segments]]/
│   │   └── api/
│   │       ├── [...slug]/route.ts      # Payload REST API
│   │       ├── graphql/route.ts
│   │       └── graphql-playground/route.ts
│   └── api/
│       └── agentation/webhook/route.ts # Agentation webhook
├── collections/
│   ├── Users.ts                  # Auth-enabled user collection
│   └── Media.ts                  # Upload collection (Vercel Blob)
├── components/
│   ├── ui/                       # shadcn components (50+)
│   ├── agentation-dev-tool.tsx   # Agentation visual feedback
│   └── theme-provider.tsx        # next-themes provider
├── hooks/
│   └── use-mobile.ts            # Mobile detection hook
├── lib/
│   └── utils.ts                  # cn() utility
├── proxy.ts                      # Route protection (token check)
├── payload.config.ts             # Payload config
└── payload-types.ts              # Generated Payload types
```

## Authentication

Auth uses Payload's built-in system with server actions and cookie-based sessions.

### Server Actions (`src/app/(frontend)/login/actions.ts`)

```typescript
// Login — calls payload.login(), sets httpOnly cookie
export async function login(prevState, formData): Promise<LoginState>

// Get current user — reads token from headers via payload.auth()
export async function getCurrentUser()

// Logout — deletes cookie, redirects to /login
export async function logout()
```

### Auth Flow

1. User submits login form (client component with `useActionState`)
2. `login()` server action calls `payload.login({ collection: 'users', data })`
3. JWT token stored as `payload-token` httpOnly cookie
4. Subsequent requests: `getCurrentUser()` calls `payload.auth({ headers })` to verify
5. Logout deletes the cookie and redirects to `/login`

### Login Page

`/login` is a server component that checks `getCurrentUser()` on render. If the user is already authenticated, it redirects to `/` (or `?redirectTo` param). Otherwise it renders the `LoginForm` client component.

## Protected Routes

Two layers of protection:

### 1. `proxy.ts` — Middleware-Level Token Check

`src/proxy.ts` checks cookie **existence only** (not validity) to avoid redirect loops:

```typescript
const PROTECTED_PATHS = ['/dashboard']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('payload-token')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}
```

The `proxyConfig.matcher` excludes `/api`, `/admin`, `/_next/static`, `/_next/image`, and common static files.

### 2. `(protected)/` Route Group — Page-Level Auth Check

Each page under `src/app/(frontend)/(protected)/` is a server component that validates the token:

```typescript
// src/app/(frontend)/(protected)/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  // ... render page
}
```

### Adding a New Protected Route

1. Add the path to `PROTECTED_PATHS` in `src/proxy.ts`
2. Create the page under `src/app/(frontend)/(protected)/your-route/page.tsx`
3. Call `getCurrentUser()` at the top and redirect if `!user`

## Plugins

### Vercel Blob Storage

Media uploads stored in Vercel Blob. Configured in `payload.config.ts`:

```typescript
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

plugins: [
  vercelBlobStorage({
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
]
```

## Commands

```bash
bun dev                   # Start dev server
bun run build             # Build for production
bunx tsc --noEmit         # Type check
bun test:int              # Integration tests (Vitest)
bun test:e2e              # E2E tests (Playwright)
bun generate:types        # Regenerate Payload types
```

## Adding Components

Use shadcn CLI:

```bash
# Add components
bunx shadcn@latest add button card dialog

# Search registries
bunx shadcn@latest search <query>

# View before install
bunx shadcn@latest view <component>

# External registries
bunx shadcn@latest add "@magicui/blur-fade"
```

## Environment Variables

| Variable                | Required | Description                        |
| ----------------------- | -------- | ---------------------------------- |
| `DATABASE_URL`          | Yes      | MongoDB connection string          |
| `PAYLOAD_SECRET`        | Yes      | Secret for Payload auth/encryption |
| `BLOB_READ_WRITE_TOKEN` | No       | Vercel Blob storage token          |

## Docker (Optional)

```bash
# Update .env: DATABASE_URL=mongodb://127.0.0.1/mydb
docker-compose up -d
bun dev
```

Docker Compose includes MongoDB and an optional (commented-out) PostgreSQL service.

## Claude Code

This project includes `.claude/` for AI-assisted development:

- `CLAUDE.md` — Project overview, commands, workflow rules
- `hooks/` — Pre-implementation skill enforcement
- `settings.json` — Permissions, formatting hooks, type checking
