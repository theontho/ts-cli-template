# Project Conventions for Code Review

## Project status
Greenfield, unreleased. **No backward compatibility.** When renaming/restructuring, update every call site and test in the same change.

## TypeScript / Bun conventions
- Lint/format handled by **Biome** — skip style nits
- Type-check via `tsc --noEmit`
- Tests via `bun test` — cover both happy and error paths
- Prefer strict types — avoid `any`; use `unknown` + narrowing for untyped boundaries
- Errors should be logged or rethrown with context — never silently swallowed

## Security
- **Always redact** keys, tokens, and credentials when displaying or logging configuration
- Never commit secrets

## Out of scope for review
- Style/formatting (Biome handles it)
- Generated/build artifacts: `node_modules/`, `dist/`, `build/`, `.next/`
- Lock files: `bun.lock`, `package-lock.json`, etc.
- Throwaway dirs: `out/`, `tmp/`, `scratch/`
