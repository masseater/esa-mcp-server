// src/esa_client/create_post.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { createPost, deletePost } from "./posts.ts"; // deletePost もインポート

// .env ファイルを読み込む
loadSync({ export: true });

Deno.test("Integration: createPost should create and then delete a post", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // ユニークな記事名と内容を生成
    const uniqueTimestamp = Date.now();
    const postName = `Test Post ${uniqueTimestamp}`;
    const postBody = `This is a test post created by integration test at ${
        new Date(uniqueTimestamp).toISOString()
    }. It should be deleted automatically.`;
    const postCategory = "Integration Tests"; // カテゴリも指定してみる

    let createdPostNumber: number | null = null; // finally で使うために変数を用意

    try {
        // 1. 記事を作成
        const createResult = await createPost({
            post: {
                name: postName,
                body_md: postBody,
                category: postCategory,
                wip: true, // 下書きとして作成
                message: "Integration test: createPost",
            },
        });

        // 2. 作成結果を検証
        assertEquals(
            createResult.ok,
            true,
            `API call failed for createPost: ${
                createResult.ok === false
                    ? createResult.error.message
                    : "Unknown error"
            }`,
        );

        if (createResult.ok) {
            const createdPost = createResult.value;
            createdPostNumber = createdPost.number; // 作成された記事番号を保存
            assertEquals(
                createdPost.name,
                postName,
                "Created post name mismatch",
            );
            assertExists(
                createdPost.full_name.startsWith(postCategory + "/"),
                "Created post category mismatch",
            );
            assertEquals(createdPost.wip, true, "Created post should be WIP");
        }
    } finally {
        // 3. 作成した記事を削除 (成功時も失敗時も実行)
        if (createdPostNumber !== null) {
            await deletePost(createdPostNumber);
        }
    }
});
