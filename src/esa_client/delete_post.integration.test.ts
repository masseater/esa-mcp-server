// src/esa_client/delete_post.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { createPost, deletePost, getPostDetail } from "./posts.ts"; // getPostDetail も追加

// .env ファイルを読み込む
loadSync({ export: true });

Deno.test("Integration: deletePost should delete a created post", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // 1. テスト用の記事を作成
    const uniqueTimestamp = Date.now();
    const postName = `Delete Test Post ${uniqueTimestamp}`;
    const postBody = `Body for delete test at ${
        new Date(uniqueTimestamp).toISOString()
    }. This should be deleted.`;
    const postCategory = "Integration Tests/Delete";

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
        `Prerequisite failed: Could not create post for delete test. ${
            createResult.ok === false
                ? createResult.error.message
                : "Unknown error"
        }`,
    );

    const postNumber = createResult.ok ? createResult.value.number : null;

    if (postNumber === null) {
        throw new Error(
            "Post creation failed, cannot proceed with delete test.",
        );
    }

    // 2. 記事を削除
    const deleteResult = await deletePost(postNumber);

    // 3. 削除結果を検証 (エラーがないことを確認)
    assertEquals(
        deleteResult.ok,
        true,
        `API call failed for deletePost(${postNumber}): ${
            deleteResult.ok === false
                ? deleteResult.error.message
                : "Unknown error"
        }`,
    );

    // 4. (念のため) 削除されたことを確認 (getPostDetail が失敗するはず)
    const verifyResult = await getPostDetail(postNumber);
    assertEquals(
        verifyResult.ok,
        false,
        `Post #${postNumber} should have been deleted, but getPostDetail succeeded.`,
    );
    if (!verifyResult.ok) {
        // ok が false であれば削除成功とみなす
    }
});
