#!/bin/bash
# Block implementation prompts that skip skill research.
# Suggests the specific skill based on context keywords.

prompt="$1"

# Only check implementation-like prompts
if ! echo "$prompt" | grep -qiE "implement|write|add|fix|create|build|update|refactor"; then
    exit 0
fi

# Allow if any skill is already mentioned
if echo "$prompt" | grep -qiE "/payload|/next-best-practices|/ai-sdk|/shadcn|/mcp-cli|/agent-browser|MCP"; then
    exit 0
fi

# Detect context and suggest specific skill
if echo "$prompt" | grep -qiE "component|ui|button|dialog|form|card|input|modal|sidebar|table|shadcn"; then
    echo "BLOCKED: Load /shadcn skill first for UI component work."
    exit 2
fi

if echo "$prompt" | grep -qiE "payload|collection|field|hook|access|migration|admin|cms"; then
    echo "BLOCKED: Load /payload skill first for PayloadCMS work."
    exit 2
fi

if echo "$prompt" | grep -qiE "route|middleware|layout|page|rsc|server.component|next|metadata|cache"; then
    echo "BLOCKED: Load /next-best-practices skill first for Next.js work."
    exit 2
fi

if echo "$prompt" | grep -qiE "\bai\b|agent|stream|llm|chat|anthropic|claude|openai"; then
    echo "BLOCKED: Load /ai-sdk skill first for AI feature work."
    exit 2
fi

# Fallback — generic block for unrecognized implementation prompts
echo "BLOCKED: Load the relevant skill before implementing."
echo "Available: /shadcn, /payload, /next-best-practices, /ai-sdk"
exit 2