# ESA MCP Server

[![JSR](https://jsr.io/badges/@masseater/esa-mcp-server)](https://jsr.io/@masseater/esa-mcp-server)
[![jsr:@masseater/esa-mcp-server](https://jsr.io/badges/@masseater/esa-mcp-server/runtime)](https://jsr.io/@masseater/esa-mcp-server?runtime=deno)

esa.io API と連携するための Model Context Protocol (MCP) サーバーです。
Deno と JSR を使用して公開されています。

## 機能

現在、以下の基本的な esa.io API 操作を MCP ツールとして提供しています：

*   ユーザー情報の取得
*   記事一覧の取得
*   記事詳細の取得
*   記事の作成
*   記事の更新
*   記事の削除

## 使い方 (JSR からの実行)

[JSR (JavaScript Registry)](https://jsr.io/) に公開されているため、ローカルにリポジトリをクローンすることなく、直接 MCP サーバーを実行できます。

### 前提条件 (Prerequisites)

*   [Deno](https://deno.land/) v2.0 以降がインストールされていること。(Deno v2.0 or later installed.)
*   インターネット接続。(Internet connection.)

### セットアップ (Setup)

1.  **環境変数の設定 (Set up environment variables):**
    サーバーを実行したいディレクトリ（通常はプロジェクトのワークスペースルート）に `.env` ファイルを作成し、以下の内容を記述します。(Create a `.env` file in the directory where you want to run the server (usually the project workspace root) and add the following content:)

    ```dotenv
    # .env
    ESA_TEAM_NAME="YOUR_ESA_TEAM_NAME" # Replace with your esa.io team name
    ESA_TOKEN="YOUR_ESA_API_TOKEN"     # Replace with your esa.io API access token
    ```
    `YOUR_ESA_TEAM_NAME` と `YOUR_ESA_API_TOKEN` を実際の値に置き換えてください。(Replace `YOUR_ESA_TEAM_NAME` and `YOUR_ESA_API_TOKEN` with your actual values.)

    **esa.io API トークンの発行方法:**
    *   あなたの esa.io チームのページにアクセスします (例: `https://<your-team-name>.esa.io/`)。
    *   右上の自分のアイコンをクリックし、「設定 (Settings)」>「アプリケーション」を選択します。
    *   「個人用アクセストークン (Personal access tokens)」セクションで、「新しいトークンを発行する (Generate new token)」をクリックします。
    *   トークン名 (例: `mcp-server`) を入力し、必要な権限スコープを選択します。この MCP サーバーには少なくとも以下の権限が必要です:
        *   `read` (記事の読み取り)
        *   `write` (記事の作成・更新・削除)
        *   `read_user` (ユーザー情報の取得)
    *   「発行する (Generate token)」をクリックします。
    *   **表示されたトークンを必ずコピーして安全な場所に保管してください。このトークンは一度しか表示されません。**
    *   コピーしたトークンを、上記 `.env` ファイルの `ESA_TOKEN` の値として貼り付けます。

### 実行 (Running)

以下のコマンドを実行します。(Run the following command:)

```bash
# 最新版を使う場合 (推奨)
deno run --allow-env --allow-net=api.esa.io --allow-read jsr:@masseater/esa-mcp-server

# 特定バージョン (例: 0.1.0) を使う場合
# deno run --allow-env --allow-net=api.esa.io --allow-read jsr:@masseater/esa-mcp-server@0.1.0
```

*   `--allow-env`: 環境変数へのアクセスを許可します。(依存ライブラリ (`npm:debug`) が内部的に環境変数全体を読み込もうとするため、特定の変数 (`ESA_TOKEN`, `ESA_TEAM_NAME`) のみを許可する `--allow-env=...` ではエラーが発生します。)
*   `--allow-net=api.esa.io`: 必要な esa.io API (`api.esa.io`) へのネットワークアクセスのみを許可します。
*   `--allow-read`: Deno が内部で利用する npm パッケージ等のキャッシュや、(もし使用する場合の) `.env` ファイルへの読み込みアクセスを許可します。
    *   **注記:** 本来はアクセス許可を最小限に絞るべきですが、Deno のキャッシュディレクトリの場所は環境によって異なるため、特定パスへの限定が困難です。そのため、ここでは利便性を考慮して `--allow-read` を使用しています。これにより、ファイルシステムへの広範な読み取りアクセスが許可される点にご注意ください。初回実行時などに Deno のキャッシュディレクトリ等へのアクセス許可を求めるプロンプトが表示される場合があります。
*   `jsr:@masseater/esa-mcp-server`: 実行する JSR パッケージを指定します。バージョンを省略すると**常に最新バージョン**が使用されます（推奨）。特定のバージョンを使用したい場合は `@<バージョン>` (例: `@0.1.0`) やバージョン範囲 (`@^0.1.0` など) を追記できます。

正常に起動すると、以下のような JSON-RPC の `ping` メッセージが標準出力に繰り返し表示されます。これはサーバーがクライアントからの接続を待機している状態を示します。終了するには `Ctrl+C` を押してください。

```json
{\"method\":\"ping\",\"jsonrpc\":\"2.0\",\"id\":0}
{\"method\":\"ping\",\"jsonrpc\":\"2.0\",\"id\":1}
{\"method\":\"ping\",\"jsonrpc\":\"2.0\",\"id\":2}
...
```


### MCPサーバーとしての設定 (Usage as MCP Server in Cursor)

Cursor で MCP サーバーとして利用する場合、`.cursor/mcp.json` に以下のように設定します。

**🚨 警告: 以下の設定例のように API トークン等を直接書き込む方法は、セキュリティリスクを伴います。`.cursor` ディレクトリが `.gitignore` で無視されていない場合、このファイルをコミットすると機密情報が漏洩します。可能な限り `.env` ファイルを使用し、`${env:VAR_NAME}` 形式で読み込むことを強く推奨します。もし直接書き込む場合は、`.cursor/mcp.json` ファイルを絶対にコミットしないでください！ 🚨**

```json
{
  "mcpServers": {
    "esa-mcp-server-jsr": {
      "command": "deno",
      "args": [
        "run",
        "--allow-env",
        "--allow-net=api.esa.io",
        "--allow-read",
        "jsr:@masseater/esa-mcp-server"
      ],
      "env": {
        "ESA_TOKEN": "YOUR_ACTUAL_ESA_API_TOKEN",
        "ESA_TEAM_NAME": "YOUR_ACTUAL_ESA_TEAM_NAME"
      }
    }
  }
}
```
*   **ポイント:**
    *   `command`: `deno` を指定します。
    *   `args`: `run` と必要なパーミッション (`--allow-env`, `--allow-net=api.esa.io`, `--allow-read`)、そして JSR パッケージの specifier を指定します。(依存ライブラリの都合上、`--allow-env` が必要です。)
    *   `env`: 環境変数を **直接** 設定します。**この方法を使用する場合、`.cursor/mcp.json` のコミットは絶対に避けてください。**

---

## 開発 (ローカル) (Local Development)

この MCP サーバーの開発に参加したり、ローカルでコードを修正・実行したりする場合は、以下の手順に従ってください。

### 前提条件 (Prerequisites)

*   [Deno](https://deno.land/) v2.0 以降がインストールされていること。(Deno v2.0 or later installed.)
*   [Git](https://git-scm.com/) がインストールされていること。(Git installed.)
*   esa.io の API トークンを持っていること。

### セットアップ (Setup)

1.  **リポジトリのクローン (Clone the repository):**
    ```bash
    git clone https://github.com/masseater/esa-mcp-server.git
    cd esa-mcp-server
    ```
2.  **環境変数の設定 (Set up environment variables):**
    `.env.example` をコピーして `.env` ファイルを作成し、あなたの esa.io API トークンとチーム名を記述します。
    ```bash
    cp .env.example .env
    # Edit .env with your actual token and team name
    ```
3.  **(推奨) Git フックの有効化 (Enable Git Hooks (Recommended)):**
    コミット前にコードのチェックを自動的に行うために、以下のコマンドを実行して Git フックをセットアップします。
    ```bash
    deno run -A https://deno.land/x/deno_hooks/mod.ts install
    ```

### ローカルでの実行 (Running Locally)

```bash
deno run --allow-env --allow-net --allow-read main.ts
```
または、ホットリロードを有効にして実行する場合:
```bash
deno task dev
```

### チェックとテスト (Checks and Tests)

以下のコマンドで、フォーマット、リント、型チェック、ユニットテストをまとめて実行できます。`pre-commit` フックにより、コミット前にも自動実行されます。
```bash
deno task check:all
```

インテグレーションテスト（実際の esa.io API と通信するテスト）は別途実行します。`.env` ファイルが正しく設定されている必要があります。
```bash
deno task test:integration
```

### JSR への公開 (Publishing to JSR)

新しいバージョンを JSR に公開する手順です。

1.  `deno.jsonc` の `version` フィールドを更新します。
2.  変更内容をコミットします。
3.  公開前のチェックを実行します。
    ```bash
    deno publish --dry-run
    ```
4.  問題がなければ公開します。
    ```bash
    deno publish
    ```

## ライセンス (License)

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。
(注: `LICENSE` ファイルがまだリポジトリにない場合は、別途追加する必要があります。)

## その他 (Misc)

### 生成元 (Generated by)

generated by Cursor (gemini-2.5-pro-exp-03-25)