# ESA MCP Server

esa.io API と連携するための Model Context Protocol (MCP) サーバーです。
Deno を使用して構築されています。

## 機能

現在、以下の基本的な esa.io API 操作を MCP ツールとして提供しています：

*   ユーザー情報の取得
*   記事一覧の取得
*   記事詳細の取得
*   記事の作成
*   記事の更新
*   記事の削除

## URL から直接実行 (Running Directly from URL)

このサーバーは、リポジトリをローカルにクローンすることなく、URL から直接実行することも可能です。

### 前提条件 (Prerequisites)

*   [Deno](https://deno.land/) v2.0 以降がインストールされていること。(Deno v2.0 or later installed.)
*   インターネット接続。(Internet connection.)

### セットアップ (Setup)

1.  **環境変数の設定 (Set up environment variables):**
    サーバーを実行したいディレクトリに `.env` ファイルを作成し、以下の内容を記述します。(Create a `.env` file in the directory where you want to run the server and add the following content:)

    ```dotenv
    # .env
    ESA_TEAM_NAME="YOUR_ESA_TEAM_NAME" # Replace with your esa.io team name
    ESA_TOKEN="YOUR_ESA_API_TOKEN"     # Replace with your esa.io API access token
    ```
    `YOUR_ESA_TEAM_NAME` と `YOUR_ESA_API_TOKEN` を実際の値に置き換えてください。(Replace `YOUR_ESA_TEAM_NAME` and `YOUR_ESA_API_TOKEN` with your actual values.)

### 実行 (Running)

以下のコマンドを実行します。(Run the following command:)

```bash
deno run --allow-env --allow-net --allow-read=.env --import-map=https://raw.githubusercontent.com/masseater/esa-mcp-server/main/deno.jsonc https://raw.githubusercontent.com/masseater/esa-mcp-server/main/main.ts
```

*   `--allow-env`: 環境変数 (`.env` から読み込んだもの) へのアクセスを許可します。
*   `--allow-net`: esa.io API との通信を許可します。
*   `--allow-read=.env`: カレントディレクトリの `.env` ファイルの読み取りを許可します。
*   `--import-map=<URL>`: モジュールの解決に使用するインポートマップ (この場合は `deno.jsonc` の URL) を指定します。

これで、ローカルにコードがなくても MCP サーバーが起動します。

**(注意) MCP サーバーとしての利用:**
一般的に、MCPサーバーとして安定して利用する場合は、ローカルにクローンして絶対パスを指定する方法が推奨されます（起動速度やデバッグのしやすさのため）。

ただし、URLから直接MCPサーバーとして実行したい場合は、`.cursor/mcp.json` で以下のように設定できます。この場合でも、機密情報（APIトークンなど）は別途実行ディレクトリに `.env` ファイルを配置して管理することを強く推奨します。

```json
{
  "mcpServers": {
    "esa-mcp-server-url": {
      "command": "deno",
      "args": [
        "run",
        "--allow-env",
        "--allow-net",
        "--allow-read=.env",
        "--import-map=https://raw.githubusercontent.com/masseater/esa-mcp-server/main/deno.jsonc",
        "https://raw.githubusercontent.com/masseater/esa-mcp-server/main/main.ts"
      ],
      "env": {
        "ESA_TOKEN": "YOUR_ESA_API_TOKEN",
        "ESA_TEAM_NAME": "YOUR_ESA_TEAM_NAME"
      }
    }
  }
}
```
*   **ポイント:**
    *   `command`: `deno` を指定します。
    *   `args`: `run` と必要なパーミッション (`--allow-env`, `--allow-net`, `--allow-read=.env`)、`--import-map` フラグ（`deno.jsonc` の URL を指定）、そして `main.ts` の URL を指定します。
    *   `env`: 環境変数を設定します。

---

## ローカルでの開発と実行 (Local Development and Execution)

### 前提条件

*   [Deno](https://deno.land/) がインストールされていること。 **v2.0 以降が必要です。** (Install [Deno](https://deno.land/). **Deno v2.0 or later is required.**)
*   esa.io の API トークンを持っていること。
*   (オプション) [Git](https://git-scm.com/) がインストールされていること (リポジトリをクローンする場合)。

### セットアップ (Setup)

1.  **リポジトリのクローン (Clone the repository):**
    ```bash
    git clone https://github.com/masseater/esa-mcp-server.git
    cd esa-mcp-server
    ```
2.  **Deno のインストール (Install Deno):**
    [Deno](https://deno.land/) をインストールします。**v2.0 以降が必要です。**
    Install [Deno](https://deno.land/). **Deno v2.0 or later is required.**
3.  **環境変数の設定 (Set up environment variables):**
    `.env.example` をコピーして `.env` ファイルを作成し、あなたのesa.io APIトークンとチーム名を記述します。
    Copy `.env.example` to create a `.env` file and fill in your esa.io API token and team name.
    ```bash
    cp .env.example .env
    # Edit .env with your actual token and team name
    ```
    セキュリティのため、`.env` ファイルは `.gitignore` に追加されており、リポジトリには含まれません。
    For security reasons, the `.env` file is included in `.gitignore` and will not be part of the repository.
4.  **(推奨) Git フックの有効化 (Enable Git Hooks (Recommended)):**
    コミット前にコードのチェックを自動的に行うために、以下のコマンドを実行して Git フックをセットアップします。
    To automatically check your code before committing, run the following command to set up Git hooks using `deno_hooks`:
    ```bash
    deno run -A https://deno.land/x/deno_hooks/mod.ts install
    ```
    これにより、`deno.jsonc` で定義された `pre-commit` タスク (`deno task check:all`) がコミット時に実行されます。
    This ensures the `pre-commit` task defined in `deno.jsonc` (`deno task check:all`) runs upon commit.

## MCPサーバーとしての使い方 (Usage as MCP Server)

Cursor でこのリポジトリを MCP サーバーとして使用する場合の設定方法です。

1.  **(オプション) MCPサーバー設定 (Configure MCP Server (Optional)):**
     `.cursor/mcp.json` に以下の設定を追加します。
    (Optional: Add the following configuration to `.cursor/mcp.json`)
    ```json
    {
      "mcpServers": {
        "esa-mcp-server": {
          "command": "deno",
          "args": [
            "run",
            "--allow-env",
            "--allow-net",
            "--allow-read",
            "ABSOLUTE_PATH_TO/esa-mcp-server/main.ts" // Replace with the actual absolute path
          ],
          "env": {
            "ESA_TOKEN": "${env:ESA_TOKEN}", // Reads from .env
            "ESA_TEAM_NAME": "${env:ESA_TEAM_NAME}" // Reads from .env
          }
        }
      }
    }
    ```
    **注意:**
    *   `ABSOLUTE_PATH_TO/esa-mcp-server/main.ts` は、あなたの環境における `main.ts` への **絶対パス** に書き換えてください。(Replace `ABSOLUTE_PATH_TO/esa-mcp-server/main.ts` with the **absolute path** to `main.ts` in your environment.)
    *   `.cursor/mcp.json` で `env` を `${env:VAR_NAME}` の形式で指定すると、`.env` ファイルから値を読み込むことができます。(Using `${env:VAR_NAME}` in `.cursor/mcp.json` allows reading values from the `.env` file.)
    *   **セキュリティ上の注意**: `.cursor/mcp.json` に直接 API トークンを書き込まないでください。`.env` ファイルを使用することを強く推奨します。(**Security Note**: Do not hardcode your API token directly in `.cursor/mcp.json`. Using the `.env` file is strongly recommended.)

## 実行 (Running)

Cursor で MCP サーバーとして設定した場合、Cursor が自動的にサーバーを起動します。

手動で実行する場合 (デバッグなど): (Manual execution for debugging etc.)

```bash
deno run --allow-env --allow-net --allow-read main.ts
```

### 利用可能なツール (Available Tools)

現在、以下のツールが利用可能です。(Currently, the following tools are available:)

*   `esa_mcp_server.user.get_info`: 現在の esa.io ユーザー情報を取得します。(Get current esa.io user information.)
*   `esa_mcp_server.posts.get_list`: 投稿一覧を取得します。(Get a list of posts.)
*   `esa_mcp_server.posts.get_detail`: 特定の投稿の詳細を取得します。(Get details of a specific post.)
*   `esa_mcp_server.posts.create`: 新しい投稿を作成します。(Create a new post.)
*   `esa_mcp_server.posts.update`: 既存の投稿を更新します。(Update an existing post.)
*   `esa_mcp_server.posts.delete`: 投稿を削除します。(Delete a post.)

## 開発

### チェックとテスト

以下のコマンドで、フォーマット、リント、型チェック、ユニットテストをまとめて実行できます。コミット前にはこのコマンドが自動的に実行されます（pre-commit フック）。

```bash
deno task check:all
```

### インテグレーションテスト

インテグレーションテスト（実際の esa.io API と通信するテスト）は別途実行します。

```bash
deno task test:integration
```

**注意:** インテグレーションテストを実行するには、有効な `ESA_TEAM_NAME` と `ESA_TOKEN` が `.env` ファイルに設定されている必要があります。

---

*この README は基本的な情報のみ記載しています。詳細はコードやコミットログを参照してください。* 

## NOTE

generated by Cursor (gemini-2.5-pro-exp-03-25)