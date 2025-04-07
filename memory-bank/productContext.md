# Product Context: esa.io MCP Client

## Problem Space

Managing `esa.io` content and information often involves repetitive tasks through the web interface or requires custom scripting for specific workflows. There's a need for a simple, command-line based tool to interact with the `esa.io` API for common operations like:

- Quickly checking user information.
- Listing and searching for posts.
- Retrieving specific post details.
- Creating, updating, and deleting posts programmatically or via simple commands.
- Potentially integrating `esa.io` operations into larger scripts or automation workflows.

## Goals

The primary goal of the `esa.io` MCP Client is to provide a straightforward and efficient command-line interface (CLI) for interacting with the `esa.io` API.

Key objectives include:

- **Simplicity:** Offer intuitive commands and options for common `esa.io` tasks.
- **Efficiency:** Allow users to perform `esa.io` operations quickly from the terminal without navigating the web UI.
- **Scriptability:** Enable integration into shell scripts or other automation tools.
- **Extensibility:** Build a foundation (the `esa_client.ts` module) that can be potentially reused for other applications (e.g., a web server, other tools).
- **Maintainability:** Use clear code, types (TypeScript), and tests (Deno test runner) for easy maintenance and future development.

## How it Should Work

The tool operates as a command-line application (`main.ts`) that parses user commands and arguments. Based on the command (e.g., `user`, `posts`, `create`), it calls corresponding functions in the underlying API client module (`src/esa_client.ts`).

The API client handles:

- Reading configuration (API token, team name) from a `.env` file.
- Constructing appropriate API requests (URL, method, headers, body).
- Sending requests to the `esa.io` API (`https://api.esa.io/v1/...`).
- Parsing API responses (JSON).
- Handling potential errors (network errors, API errors) and returning results in a consistent format (`Result<T, Error>`).

The CLI (`main.ts`) then displays the results (or errors) to the user in the terminal, typically as formatted JSON output.

## User Experience

- **Configuration:** Simple setup via a standard `.env` file.
- **Command Structure:** Familiar CLI pattern (`command [subcommand/args] [options]`).
- **Feedback:** Clear output indicating the action being performed, success messages, or informative error messages.
- **Output:** Raw API data (JSON) is displayed for now, allowing users to pipe it to tools like `jq` if needed. Future improvements could include more user-friendly formatting.
- **Safety:** Destructive operations (`delete`) should ideally include confirmation prompts in the future, though the current implementation executes them directly. Testing focuses on using temporary data to avoid accidental deletion of important posts.
