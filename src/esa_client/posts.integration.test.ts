// src/esa_client/posts.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { getPosts } from "./posts.ts"; // getPosts をインポート

// .env ファイルを読み込む
loadSync({ export: true });

// テストケース
Deno.test("Integration: getPosts should fetch actual post list", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // API 呼び出し (引数なしで基本的な取得を試す)
    const result = await getPosts();

    // アサーション
    assertEquals(
        result.ok,
        true,
        `API call failed: ${
            result.ok === false ? result.error.message : "Unknown error"
        }`,
    );

    if (result.ok) {
        assertExists(result.value.posts, "Posts array should exist");
        // posts 配列が空でないことを確認 (テスト環境に記事がある前提)
        assertExists(
            result.value.posts.length > 0,
            "Posts array should not be empty",
        );
        // 最初の記事に必要なプロパティがあるか確認
        if (result.value.posts.length > 0) {
            const firstPost = result.value.posts[0];
            assertExists(firstPost.number, "Post number should exist");
            assertExists(firstPost.name, "Post name should exist");
            assertExists(firstPost.full_name, "Post full_name should exist");
            assertExists(firstPost.created_by, "Post created_by should exist");
        }
    }
});
