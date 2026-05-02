# TypeScript CLI Template (Bun)

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
5.  **Run the application:**
    ```bash
    bun start run
    ```
6.  **Run tests:**
    ```bash
    bun test
    ```

## Configuration

Configuration is stored in `~/.config/typescript-cli-template/config.json` (on macOS/Linux).

## Development

- **Linting:** `bun run lint`
- **Formatting:** `bun run format`
- **Type Checking:** Handled natively by Bun's runtime and test runner.
