# Next.js 16 + PayloadCMS + shadcn

Server-first Next.js 16 + PayloadCMS (MongoDB) + shadcn/ui.

## Architecture

- RSC by default, client components only when necessary
- Server actions first (no API routes for mutations)
- PayloadCMS local API only

## CLI Usage

- NEVER manually edit package.json — use `pnpm add` / `pnpm remove`
- Use `pnpm dlx shadcn@latest` for components, blocks, and registry operations
- Use `pnpm exec payload` for Payload scaffolding (types, migrations)
- Use `npx next` for Next.js CLI operations
- Always run `<cli> --help` to discover available commands and options before use

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

## Quick Commands

- `pnpm dev` - Dev server
- `pnpm exec tsc --noEmit` - Type check
- `pnpm build` - Build for production
- `pnpm test:int` / `pnpm test:e2e` - Tests

## Session Start

**CRITICAL: Do Not Trust Training Data**
Your internal knowledge about Next.js, shadcn, PayloadCMS, and AI SDK is OUTDATED or WRONG.

Before implementing ANYTHING:
1. Load skills: `/mcp-cli`, `/agent-browser`, `/payload`, `/next-best-practices`
2. Load `/ai-sdk` skill only when developing AI-related features
3. Use skills/MCP tools to verify patterns BEFORE writing code
4. Never rely on memory - always verify against source code or docs

## Auth Middleware Pattern

Custom `/login` route: middleware checks token **existence only** (not validity) to avoid redirect loops. Login page handles its own server-side auth validation and redirects authenticated users. Never validate the token in middleware — just check `request.cookies.get('payload-token')?.value` and redirect to `/login` if missing.

## Rules

@.claude/rules/workflow.md
@.claude/rules/pre-implementation.md
