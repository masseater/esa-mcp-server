import { /*afterEach, beforeEach,*/ describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import type { EsaPost } from "../../esa_client/types.ts";
import { logic } from "./update.ts";

describe("updatePostLogic", () => {
    describe("getClientParams", () => {
        it("は、検証済み引数をラップ関数用の正しい形式に変換すること", () => {
            const validatedData = {
                post_number: 123,
                post: { name: "Updated Name", wip: false },
            };
            const expectedParams = {
                postNumber: 123,
                body: { post: { name: "Updated Name", wip: false } },
            };
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });

    describe("formatSuccessOutput", () => {
        it("は、更新された投稿の情報を含む成功メッセージを生成すること", () => {
            const mockPost = {
                number: 789,
                full_name: "category/Updated Post Title",
            } as EsaPost; // Use the correct type
            const expectedMessage =
                `Successfully updated post #789: category/Updated Post Title`;
            // Use non-null assertion as formatSuccessOutput exists
            const result = logic.formatSuccessOutput!(mockPost);
            assertEquals(result, expectedMessage);
        });
    });
});
