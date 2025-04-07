# System Patterns: esa.io MCP Server

## Core Principles

- **API Client Abstraction:** `src/esa_client.ts` encapsulates all direct interactions with the esa.io API.
- **Type Safety:** TypeScript is used throughout. Interfaces (`EsaUser`, `EsaPost`, etc.) define the expected structure of API responses.
- **Error Handling with Result Type:** Functions interacting with the API (e.g., `getUserInfo`, `getPosts`, `getPostDetail`) return a `Promise<Result<T, Error>>`.
  - `Result<T, E>` is defined as `{ ok: true, value: T } | { ok: false; error: E }`.
  - Helper functions `ok(value)` and `err(error)` are used to construct `Result` objects.
  - This pattern makes success/failure explicit and forces callers to handle potential errors.
- **Configuration via `.env`:** API credentials (`ESA_TOKEN`, `ESA_TEAM_NAME`) are loaded from a `.env` file using `deno.land/std/dotenv`. This file is excluded from Git via `.gitignore`.
- **Testing:** Deno's built-in test runner (`deno test`) is used. Tests are placed alongside source files (e.g., `src/esa_client_test.ts`). Tests require `--allow-env`, `--allow-net`, `--allow-read` permissions and use `deno.jsonc` via the `--config` flag. Assertions use `deno.land/std/assert`.
