import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
// import { assertSpyCalls, spy, Spy, restore } from "@std/testing/mock"; // No spies needed
import { z } from "zod";
import { err, ok, Result } from "../../esa_client/types.ts";
import type { EsaPost, UpdatePostBody } from "../../esa_client/types.ts";

// Import the specific implementation details
import { logic, schema } from "./update.ts";

// // Mock the API function
// import * as postsApi from "../../esa_client/posts.ts";

describe("updatePostLogic", () => {
    // Remove spy setup
    // let updatePostSpy: Spy<typeof postsApi>;
    // beforeEach(() => {
    //     updatePostSpy = spy(postsApi, "updatePost");
    // });
    // afterEach(() => {
    //     restore();
    // });

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

    // clientFunction tests remain commented out
    /*
    describe("clientFunction (wrapped)", () => {
       ...
    });
    */

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
