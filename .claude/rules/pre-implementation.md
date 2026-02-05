---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "collections/**/*.ts"
  - "lib/**/*.ts"
  - "components/**/*.tsx"
---

# Pre-Implementation (MANDATORY)

CRITICAL: Training data is OUTDATED for all frameworks below.
NEVER assume APIs, patterns, or usage without verification.

## UI Components

1. `/mcp-cli` → shadcn MCP → search component
2. READ docs from MCP output (don't assume)
3. Then implement

## Next.js Features

1. `/mcp-cli` → Next.js DevTools MCP → search feature
2. `/next-best-practices` skill → verify patterns
3. Then implement

## PayloadCMS

1. `/payload` skill → search hooks/access/API
2. READ skill output (don't assume field syntax)
3. Then implement

## AI Features

1. `/ai-sdk` skill → search agents/streaming/tools
2. READ output (SDK APIs change frequently)
3. Then implement

**VIOLATIONS:**

- NEVER implement UI without shadcn MCP search
- NEVER add Next.js features without DevTools MCP
- NEVER write Payload code without `/payload` skill
- NEVER implement AI features without `/ai-sdk` skill
- NEVER assume component/API syntax from memory
- NEVER skip reading tool/skill output
- NEVER use client components without justification
- NEVER use Payload REST/GraphQL from server
