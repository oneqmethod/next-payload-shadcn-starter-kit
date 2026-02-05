---
paths:
  - "**/*"
---

# Workflow (MANDATORY)

## Research Phase (FIRST)

CRITICAL: Gather information BEFORE planning.

1. Identify frameworks/tools involved
2. Load required skills (`/payload`, `/next-best-practices`, `/ai-sdk`)
3. Use MCP tools to search docs
4. READ outputs - don't assume
5. THEN proceed to planning

## Planning Phase

- Spin up Explore agents in parallel for context gathering
- No limit on agents - use as many as needed for independent research paths
- **Create tasks with TaskCreate for each implementation step**
- **Set dependencies with TaskUpdate if sequential**
- Monitor context consumption; agents return summaries

## Implementation Phase

1. Use TaskList to see available tasks
2. Claim task: TaskUpdate with status=in_progress
3. Implement ONE task at a time
4. Complete: TaskUpdate with status=completed
5. Session end: `git commit && git push`

**VIOLATIONS:**

- NEVER skip research phase
- NEVER implement without consulting skills/tools
- NEVER assume training data is current
- NEVER edit code without claimed task (status=in_progress)
- NEVER leave tasks in_progress at session end
- NEVER end session without `git push`
