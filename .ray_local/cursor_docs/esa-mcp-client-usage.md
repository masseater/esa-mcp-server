# esa.io MCP Client CLI Usage

This document describes how to use the `esa.io` MCP (My Command Post) Client CLI tool.

## Prerequisites

- Deno installed
- `.env` file configured with `ESA_TOKEN` and `ESA_TEAM_NAME`

## Basic Usage

Run commands using `deno task start <command> [options]` or `deno run --allow-env --allow-net --allow-read main.ts <command> [options]`.

## Available Commands

### `user`

Displays the authenticated user's information.

**Usage:**

```bash
deno task start user
```

### `posts`

Fetches a list of posts.

**Usage:**

```bash
# Fetch default list (latest 20 posts)
deno task start posts

# Search posts with a query
deno task start posts --query "search term"
deno task start posts -q "search term"

# TODO: Add options for pagination (--page, --per_page)
```

### `post`

Fetches the details of a specific post.

**Usage:**

```bash
deno task start post <post_number>

# Example: Fetch post number 1
deno task start post 1
```

### `create`

Creates a new post.

**Options:**

- `--name "<title>"` (Required): Title of the post.
- `--message "<message>"` (Required): Commit message for the creation.
- `--body "<body>"` (Optional): Body content in Markdown. Defaults to empty.
- `--tags "<tag1>,<tag2>"` (Optional): Comma-separated tags.
- `--category "<category/path>"` (Optional): Category path.
- `--wip=<true|false>` (Optional): WIP status. Defaults to `true` (but might become `false` on esa.io depending on API behavior).

**Usage:**

```bash
# Create a simple WIP post
deno task start create --name "My WIP Post" --message "Initial draft"

# Create a post with details, tags, category, and mark as not WIP
deno task start create --name "Published Post" --message "Publish post" --body "Details here." --tags "release,docs" --category "Documents/Release" --wip=false
```

### `update`

Updates an existing post. Requires the post number.

**Options:**

- `--message "<message>"` (Required): Commit message for the update.
- `--name "<title>"` (Optional): New title.
- `--body "<body>"` (Optional): New body content.
- `--tags "<tag1>,<tag2>"` (Optional): New set of tags (overwrites existing).
- `--category "<category/path>"` (Optional): New category path.
- `--wip=<true|false>` (Optional): New WIP status.

**Usage:**

```bash
# Update title and body of post 123
deno task start update 123 --name "Updated Title" --body "New content." --message "Revise post"

# Update tags and WIP status of post 456
deno task start update 456 --tags "refactored,important" --wip=false --message "Update metadata"
```

### `delete`

Deletes a specific post. **Warning:** This action is irreversible!

**Usage:**

```bash
deno task start delete <post_number>

# Example: Delete post 789
deno task start delete 789
```

## Future Improvements

- Add pagination options (`--page`, `--per_page`) to the `posts` command.
- Add interactive confirmation before deleting a post.
- Improve output formatting (e.g., table view for posts list).
