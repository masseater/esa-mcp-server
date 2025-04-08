// src/esa_client/post_detail.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { getPostDetail, getPosts } from "./posts.ts"; // getPosts もインポート

// .env ファイルを読み込む
loadSync({ export: true });

Deno.test("Integration: getPostDetail should fetch actual post details", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // 1. まず存在する記事の番号を取得する
    const postsResult = await getPosts({ per_page: 1 }); // 1件だけ取得すれば十分
    assertEquals(
        postsResult.ok,
        true,
        `Failed to get posts list to find a post number: ${
            postsResult.ok === false
                ? postsResult.error.message
                : "Unknown error"
        }`,
    );
    assertExists(
        postsResult.ok && postsResult.value.posts.length > 0,
        "Could not find any post to test getPostDetail. Ensure your esa team has at least one post.",
    );

    const postNumber = postsResult.ok ? postsResult.value.posts[0].number : -1; // 型ガードのため
    if (postNumber === -1) {
        throw new Error("Failed to extract post number."); // ここには来ないはず
    }

    // 2. 取得した番号で記事詳細を取得する
    const detailResult = await getPostDetail(postNumber);

    // 3. アサーション
    assertEquals(
        detailResult.ok,
        true,
        `API call failed for getPostDetail(${postNumber}): ${
            detailResult.ok === false
                ? detailResult.error.message
                : "Unknown error"
        }`,
    );

    if (detailResult.ok) {
        const postDetail = detailResult.value;
        assertEquals(
            postDetail.number,
            postNumber,
            "Fetched post number should match requested number",
        );
        assertExists(postDetail.name, "Post name should exist");
        assertExists(postDetail.full_name, "Post full_name should exist");
        assertExists(postDetail.body_md, "Post body_md should exist"); // 詳細なので本文も確認
        assertExists(postDetail.created_by, "Post created_by should exist");
        assertExists(postDetail.updated_at, "Post updated_at should exist");
    }
});
