import { parseArgs } from "cli";
import {
  getUserInfo,
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  CreatePostBody,
  UpdatePostBody,
  // 必要に応じて型もインポート
} from "./src/esa_client.ts";

// コマンドライン引数を解析
// deno run main.ts <command> [options/args]
const flags = parseArgs(Deno.args, {
  string: ["query", "name", "body", "message", "category", "tags"], // 文字列として扱うオプション
  boolean: ["wip"], // 真偽値として扱うオプション
  alias: { q: "query", n: "name", b: "body", m: "message", t: "tags" }, // 短縮形エイリアス
});

const command = flags._[0]; // メインコマンド (例: 'user', 'posts', 'post', 'create')
const args = flags._.slice(1); // コマンド以降の引数 (例: 'post 123' の '123')

async function main() {
  console.log("--- esa.io MCP Client ---");
  // console.log("Parsed Flags:", flags); // デバッグ用

  switch (command) {
    case "user": {
      console.log("Fetching user info...");
      const result = await getUserInfo();
      if (result.ok) {
        console.log("User Info:", JSON.stringify(result.value, null, 2));
      } else {
        console.error("Error fetching user info:", result.error.message);
        Deno.exit(1);
      }
      break;
    }

    case "posts": {
      const query = flags.query;
      console.log(`Fetching posts${query ? ` with query "${query}"` : ""}...`);
      const options = {
        q: query,
        // page, per_page も flags から取得できるように後で追加するのだ
      };
      const result = await getPosts(options);
      if (result.ok) {
        console.log(`Found ${result.value.total_count} posts.`);
        console.log(JSON.stringify(result.value.posts, null, 2)); // まずは全件表示
        // TODO: 表示件数制限や、詳細表示への誘導など
        if (result.value.next_page) {
          console.log(`\nNext page: ${result.value.next_page}`);
        }
      } else {
        console.error("Error fetching posts:", result.error.message);
        Deno.exit(1);
      }
      break;
    }

    case "post": {
      const postNumber = Number(args[0]);
      if (!postNumber || postNumber <= 0) {
        console.error("Invalid or missing post number.");
        console.log("Usage: deno run ... main.ts post <post_number>");
        Deno.exit(1);
      }
      console.log(`Fetching post detail for #${postNumber}...`);
      const result = await getPostDetail(postNumber);
      if (result.ok) {
        console.log(JSON.stringify(result.value, null, 2));
      } else {
        console.error(
          `Error fetching post #${postNumber}:`,
          result.error.message
        );
        Deno.exit(1);
      }
      break;
    }

    case "create": {
      const name = flags.name;
      const body = flags.body ?? ""; // 本文は省略可能かもしれないのでデフォルト空文字
      const message = flags.message; // コミットメッセージは必須と考える
      const tags = flags.tags
        ? flags.tags.split(",").map((t) => t.trim())
        : undefined; // カンマ区切りでパース
      const category = flags.category;
      const wip = flags.wip ?? true; // デフォルトは WIP とする

      if (!name) {
        console.error("Error: --name option is required for create command.");
        Deno.exit(1);
      }
      if (!message) {
        console.error(
          "Error: --message option is required for create command."
        );
        Deno.exit(1);
      }

      const postData: CreatePostBody = {
        post: {
          name,
          body_md: body,
          tags,
          category,
          wip,
          message,
        },
      };

      console.log(`Creating post \"${name}\"`);
      const result = await createPost(postData);

      if (result.ok) {
        console.log("Post created successfully!");
        console.log(JSON.stringify(result.value, null, 2));
      } else {
        console.error("Error creating post:", result.error.message);
        Deno.exit(1);
      }
      break;
    }

    case "update": {
      const postNumber = Number(args[0]);
      if (!postNumber || postNumber <= 0) {
        console.error("Invalid or missing post number.");
        console.log(
          "Usage: deno run ... main.ts update <post_number> [options]"
        );
        Deno.exit(1);
      }

      // 更新データを作成
      const updateData: UpdatePostBody = { post: {} };
      let hasUpdate = false; // 何か更新する項目があるか

      // 各オプションが存在すれば更新データに追加
      if (flags.name !== undefined) {
        updateData.post.name = flags.name;
        hasUpdate = true;
      }
      if (flags.body !== undefined) {
        updateData.post.body_md = flags.body;
        hasUpdate = true;
      }
      if (flags.tags !== undefined) {
        updateData.post.tags = flags.tags.split(",").map((t) => t.trim());
        hasUpdate = true;
      }
      if (flags.category !== undefined) {
        updateData.post.category = flags.category;
        hasUpdate = true;
      }
      if (flags.wip !== undefined) {
        updateData.post.wip = flags.wip;
        hasUpdate = true;
      }
      // 更新メッセージは必須とする (APIの仕様でもある)
      if (flags.message === undefined) {
        console.error(
          "Error: --message option is required for update command."
        );
        Deno.exit(1);
      }
      updateData.post.message = flags.message;
      hasUpdate = true; // メッセージは常に更新項目

      if (!hasUpdate) {
        console.error(
          "Error: No update options provided. Use --name, --body, etc."
        );
        Deno.exit(1);
      }

      console.log(`Updating post #${postNumber}...`);
      const result = await updatePost(postNumber, updateData);

      if (result.ok) {
        console.log("Post updated successfully!");
        console.log(JSON.stringify(result.value, null, 2));
      } else {
        console.error(
          `Error updating post #${postNumber}:`,
          result.error.message
        );
        Deno.exit(1);
      }
      break;
    }

    case "delete": {
      const postNumber = Number(args[0]);
      if (!postNumber || postNumber <= 0) {
        console.error("Invalid or missing post number.");
        console.log("Usage: deno run ... main.ts delete <post_number>");
        Deno.exit(1);
      }

      // 本当に削除して良いか確認するステップを入れるのが親切かもしれないが、
      // まずはシンプルにそのまま削除を実行するのだ。
      // 必要であれば後で確認ステップを追加するのだ。

      console.log(`Deleting post #${postNumber}...`);
      const result = await deletePost(postNumber);

      if (result.ok) {
        console.log(`Post #${postNumber} deleted successfully!`);
      } else {
        console.error(
          `Error deleting post #${postNumber}:`,
          result.error.message
        );
        Deno.exit(1);
      }
      break;
    }

    default:
      console.log(`Unknown command: ${command}`);
      console.log(
        "Available commands: user, posts, post, create, update, delete"
      );
      Deno.exit(1);
  }
}

// メイン関数を実行
main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  Deno.exit(1);
});
