// src/esa_client/post_detail.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { createPost, deletePost, getPostDetail } from "./posts.ts";

// .env ファイルを読み込む
loadSync({ export: true });

Deno.test("Integration: getPostDetail should fetch details of a created post", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // 1. テスト用の記事を作成
    const uniqueTimestamp = Date.now();
    const postName = `Test Detail Post ${uniqueTimestamp}`;
    const postBody = `Body for detail test at ${
        new Date(uniqueTimestamp).toISOString()
    }.`;
    const postCategory = "Integration Tests/Detail";

    const createResult = await createPost({
        post: {
            name: postName,
            body_md: postBody,
            category: postCategory,
            wip: true,
        },
    });

    assertEquals(
        createResult.ok,
        true,
        `Prerequisite failed: Could not create post for getPostDetail test. ${
            createResult.ok === false
                ? createResult.error.message
                : "Unknown error"
        }`,
    );

    const postNumber: number | null = createResult.ok
        ? createResult.value.number
        : null;

    try {
        if (postNumber === null) {
            throw new Error(
                "Post creation failed, cannot proceed with getPostDetail test.",
            );
        }

        // 2. 作成した記事の詳細を取得
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
            assertEquals(
                postDetail.name,
                postName,
                "Fetched post name mismatch",
            ); // 作成時の名前と比較
            assertExists(postDetail.body_md, "Post body_md should exist");
            assertExists(postDetail.created_by, "Post created_by should exist");
        }
    } finally {
        // 4. 作成した記事を削除
        if (postNumber !== null) {
            await deletePost(postNumber);
        }
    }
});
