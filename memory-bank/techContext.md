# Technical Context: esa.io MCP Server

## Core Technology

- **Runtime:** Deno
- **Language:** TypeScript

## Key Dependencies

- **Environment Variables:** `deno.land/std/dotenv` (for loading `.env` files)

## Development Environment Setup

1.  **Install Deno:** Follow instructions on the [Deno website](https://deno.land/#installation). Ensure the `deno` command is available in your PATH.
2.  **Clone Repository:** `git clone <repository_url>`
3.  **Create `.env` file:** Create a `.env` file in the project root with the following content:
    ```dotenv
    ESA_TOKEN=your_esa_api_token
    ESA_TEAM_NAME=your_esa_team_name
    ```
    _Replace placeholders with your actual esa.io API token and team name._
4.  **Run:** Use `deno run --allow-env --allow-net main.ts` (permissions might need adjustment based on implementation).
5.  **Test:** Use `deno test --allow-env --allow-net` (permissions might need adjustment).
6.  **Lint & Format:**
    - `deno lint`
    - `deno fmt`

## Configuration Files

- `.env`: Stores API token and team name (must not be committed to Git).
- `.gitignore`: Excludes `.env` and potentially other files (like `node_modules` if used, build artifacts, etc.).
- `deno.jsonc`: Deno configuration, including tasks, lint/format settings, and import maps.
- `.cursorrules`: Project context and guidelines for AI assistant.
