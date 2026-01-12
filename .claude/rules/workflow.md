# Workflow (MANDATORY)

1. Plan first
2. `bd create "title"` for each task
3. `bd update <id> --status in_progress`
4. Implement ONE issue at a time
5. `bd close <id>` when done
6. Session end: `bd sync && git commit && git push`

**VIOLATIONS:**

- NEVER edit code without claimed bd issue
- NEVER commit without `bd sync`
- NEVER end session without `git push`
