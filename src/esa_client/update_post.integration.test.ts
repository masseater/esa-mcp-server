// src/esa_client/update_post.integration.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { loadSync } from "dotenv";
import { createPost, deletePost, updatePost } from "./posts.ts";

// .env ファイルを読み込む
loadSync({ export: true });

Deno.test("Integration: updatePost should update and then delete a post", async () => {
    // 環境変数のチェック
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    // 1. テスト用の記事を作成
    const uniqueTimestamp = Date.now();
    const initialName = `Initial Test Post ${uniqueTimestamp}`;
    const initialBody = `Initial body for update test at ${
        new Date(uniqueTimestamp).toISOString()
    }.`;
    const initialCategory = "Integration Tests/Update";

    const createResult = await createPost({
        post: {
            name: initialName,
            body_md: initialBody,
            category: initialCategory,
            wip: true,
        },
    });

    assertEquals(
        createResult.ok,
        true,
        `Prerequisite failed: Could not create initial post for update test. ${
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
                "Initial post creation failed, cannot proceed with update test.",
            );
        }

        // 2. 記事を更新
        const updatedName = `Updated Test Post ${uniqueTimestamp}`;
        const updatedBody = `Updated body at ${new Date().toISOString()}.`;
        const updateResult = await updatePost(postNumber, {
            post: {
                name: updatedName,
                body_md: updatedBody,
                message: "Integration test: updatePost",
            },
        });

        // 3. 更新結果を検証
        assertEquals(
            updateResult.ok,
            true,
            `API call failed for updatePost(${postNumber}): ${
                updateResult.ok === false
                    ? updateResult.error.message
                    : "Unknown error"
            }`,
        );

        if (updateResult.ok) {
            const updatedPost = updateResult.value;
            assertEquals(
                updatedPost.number,
                postNumber,
                "Updated post number mismatch",
            );
            assertEquals(
                updatedPost.name,
                updatedName,
                "Updated post name mismatch",
            );
            // 注意: body_md はレスポンスに含まれないことがあるため、直接比較は難しい場合がある
            assertExists(
                updatedPost.body_html,
                "Updated post should have body_html",
            );
        }
    } finally {
        // 4. 最初に作成した記事を削除
        if (postNumber !== null) {
            await deletePost(postNumber);
        }
    }
});
