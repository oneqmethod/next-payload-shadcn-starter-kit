#!/bin/bash
# Block implementation prompts that skip skill/tool research

prompt="$1"

# Check for implementation keywords
if echo "$prompt" | grep -qiE "implement|write|add|fix|create|build"; then
    # Allow if skill is mentioned
    if echo "$prompt" | grep -qiE "/payload|/next-best-practices|/ai-sdk|/mcp-cli|/agent-browser|shadcn|MCP"; then
        exit 0  # Allow
    fi
    # Block with guidance
    echo "BLOCKED: Consult skills before implementing."
    echo "Load: /payload, /next-best-practices, /ai-sdk, or /mcp-cli first."
    exit 2
fi

exit 0  # Allow non-implementation prompts
