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

## 前提条件

*   [Deno](https://deno.land/) (v1.x.x 以降) がインストールされていること。
*   esa.io の API トークンを持っていること。

## セットアップ

1.  リポジトリをクローンします。
    ```bash
    git clone <repository-url>
    cd esa-mcp-server
    ```

2.  プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定します。
    ```dotenv
    # .env
    ESA_TEAM_NAME="YOUR_ESA_TEAM_NAME" # 例: "myteam"
    ESA_TOKEN="YOUR_ESA_API_TOKEN"     # 例: "abcdef12345..."
    ```
    `YOUR_ESA_TEAM_NAME` と `YOUR_ESA_API_TOKEN` を実際の値に置き換えてください。

## 使い方

### 開発モード (ファイルの変更を監視)

```bash
deno task dev
```

### 本番モード

```bash
deno task start
```

サーバーが起動し、MCP クライアントからの接続を待ち受けます。

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