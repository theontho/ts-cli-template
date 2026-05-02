# Gemini Project Instructions

You are working on the `typescript-cli-template` project. Follow these guidelines to ensure consistency and quality.

## Development Workflow

1.  **Dependency Management:** Use `npm`.
2.  **Code Quality:**
    - After any code change, run `npm run check`.
    - Run `npm run build` to verify types.
3.  **Testing:**
    - Run tests using `npm test`.
4.  **Experimentation:** Use the `scripts/` directory for temporary scripts or experiments.
5.  **Output:** Direct all logs or temporary artifacts to `out/` or `tmp/`.

## Architecture

- Follow the `src/` layout.
- Use `zod` for data models and configuration validation.
- Use `chalk` for console output.
- Use `commander` for CLI subcommands (`precheck`, `config`, `run`).
- Use `platformdirsjs` for platform-standard configuration paths.

## CI/CD

- GitHub Actions are defined in `.github/workflows/ci.yml`.
- Ensure all checks pass before considering a task complete.
