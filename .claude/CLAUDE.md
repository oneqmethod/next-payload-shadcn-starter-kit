- RSC by default, client components only when necessary
- Server actions first (no API routes for mutations)
- PayloadCMS local API only

## CLI Usage

- NEVER manually edit package.json — use `bun add` / `bun remove`
- Use `bunx shadcn@latest` for components, blocks, and registry operations
- Use `bunx payload` for Payload scaffolding (types, migrations)
- Use `bunx next` for Next.js CLI operations
- Always run `<cli> --help` to discover available commands and options before use

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
bunx opensrc <package>           # npm package (e.g., bunx opensrc zod)
bunx opensrc pypi:<package>      # Python package (e.g., bunx opensrc pypi:requests)
bunx opensrc crates:<package>    # Rust crate (e.g., bunx opensrc crates:serde)
bunx opensrc <owner>/<repo>      # GitHub repo (e.g., bunx opensrc vercel/ai)
```

## Quick Commands

- `bun dev` - Dev server
- `bunx tsc --noEmit` - Type check
- `bun run build` - Build for production
- `bun test:int` / `bun test:e2e` - Tests

## Auth Middleware Pattern

Custom `/login` route: middleware checks token **existence only** (not validity) to avoid redirect loops. Login page handles its own server-side auth validation and redirects authenticated users. Never validate the token in middleware — just check `request.cookies.get('payload-token')?.value` and redirect to `/login` if missing.

## Skills — Load Per Context

Training data is OUTDATED. Never assume APIs/patterns. Load the right skill BEFORE implementing:

| Context          | Skill                  | When                                       |
| ---------------- | ---------------------- | ------------------------------------------ |
| UI components    | `/shadcn`              | Adding/modifying shadcn components         |
| Next.js features | `/next-best-practices` | Routes, layouts, middleware, RSC patterns  |
| PayloadCMS       | `/payload`             | Collections, fields, hooks, access control |
| AI features      | `/ai-sdk`              | Agents, streaming, tools, AI SDK usage     |

READ skill output before writing code. Never assume syntax from memory.

## Workflow

1. **Research** — identify frameworks involved, load relevant skill(s), read output
2. **Plan** — explore codebase w/ agents, create tasks via TaskCreate
3. **Implement** — one task at a time (claim w/ in_progress, complete when done)
4. **Verify** — type check passes → commit and push

## Rules

- NEVER skip research phase
- NEVER implement without consulting relevant skill
- NEVER assume training data is current
- NEVER use client components without justification
- NEVER use Payload REST/GraphQL from server (local API only)
- NEVER edit code without claimed task (status=in_progress)
