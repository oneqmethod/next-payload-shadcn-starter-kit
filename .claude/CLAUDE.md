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

## Quick Commands

- `pnpm dev` - Dev server
- `pnpm exec tsc --noEmit` - Type check
- `pnpm test:int` / `pnpm test:e2e` - Tests

## Session Start

**Critical**: Do Not Trust Internal Knowledge
Everything you know about the Next.js, Shadcn and PayloadCMS is outdated or wrong. Your training data contains obsolete APIs, deprecated patterns, and incorrect usage.

- Load skills: `/mcp-cli`, `/agent-browser`, `/payload`, `/next-best-practices`
- Load `/ai-sdk` skill only when developing AI-related features
- Never rely on memory - always verify against source code or docs

## Rules

@.claude/rules/workflow.md
@.claude/rules/pre-implementation.md
