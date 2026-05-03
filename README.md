# ts-cli-template (Bun)

A best-practice TypeScript CLI project template powered by [Bun](https://bun.sh/).

## Features

- **Runtime:** [Bun](https://bun.sh/) for ultra-fast execution, native TypeScript support, and built-in testing.
- **CLI Framework:** [Commander.js](https://github.com/tj/commander.js) for structured subcommands.
- **Linting & Formatting:** [Biome](https://biomejs.dev/) for ultra-fast linting and formatting.
- **Configuration:** Platform-standard config paths using `platformdirs` and `zod` for validation.
- **Visuals:** Emoji-enhanced logging with `chalk` and timestamps.
- **Compilation:** Easy binary compilation using `bun build --compile`.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Run pre-check:**
    ```bash
    bun start precheck
    ```
4.  **Initialize config:**
    ```bash
    bun start config init
    ```
5.  **Setup Development Environment:**
    ```bash
    bun run setup-hooks    # Install git hooks
    bun run dev-register   # Register your git identity
    ```
6.  **Run the application:**
    ```bash
    bun start run
    ```
7.  **Run tests:**
    ```bash
    bun test
    ```

## Configuration

Configuration is stored in `~/.config/ts-cli-template/config.json` (on macOS/Linux).

## Development

- **Linting:** `bun run lint`
- **Formatting:** `bun run format`
- **Check (Lint + Format + Fix):** `bun run check`
- **Type Checking:** Handled natively by Bun's runtime and test runner.

## Build

Compile your CLI into a single, standalone executable:

```bash
bun run build
```

The output will be located in `dist/ts-cli-template`. This binary includes the Bun runtime, your code, and all dependencies.
