# TypeScript CLI Template

A best-practice TypeScript CLI project template.

## Features

- **TypeScript & ESM:** Modern TypeScript setup with native ESM support.
- **CLI Framework:** [Commander.js](https://github.com/tj/commander.js) for structured subcommands.
- **Linting & Formatting:** [Biome](https://biomejs.dev/) for ultra-fast linting and formatting.
- **Testing:** [Vitest](https://vitest.dev/) for fast unit and integration testing.
- **Configuration:** Platform-standard config paths using `platformdirsjs` and `zod` for validation.
- **Visuals:** Emoji-enhanced logging with `chalk` and timestamps.
- **Global Installation:** Optimized for global installation via `npm install -g .`.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the project:**
    ```bash
    npm run build
    ```
4.  **Run pre-check:**
    ```bash
    npm run dev -- precheck
    ```
5.  **Initialize config:**
    ```bash
    npm run dev -- config init
    ```
6.  **Run the application:**
    ```bash
    npm run dev -- run
    ```
7.  **Run tests:**
    ```bash
    npm test
    ```

## Configuration

Configuration is stored in `~/.config/typescript-cli-template/config.json` (on macOS/Linux).

## Development

- **Linting:** `npm run lint`
- **Formatting:** `npm run format`
- **Type Checking:** `npm run build`
