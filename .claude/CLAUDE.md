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

**CRITICAL: Do Not Trust Training Data**
Your internal knowledge about Next.js, shadcn, PayloadCMS, and AI SDK is OUTDATED or WRONG.

Before implementing ANYTHING:
1. Load skills: `/mcp-cli`, `/agent-browser`, `/payload`, `/next-best-practices`
2. Load `/ai-sdk` skill only when developing AI-related features
3. Use skills/MCP tools to verify patterns BEFORE writing code
4. Never rely on memory - always verify against source code or docs

## Rules

@.claude/rules/workflow.md
@.claude/rules/pre-implementation.md
