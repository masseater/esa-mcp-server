import {
    describe,
    it, // describe, it を復活
    // beforeEach,
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals, assertExists, assertObjectMatch } from "@std/assert";
import { returnsNext, stub } from "@std/testing/mock"; // インポートパス確認
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed

// Import the specific implementation details
import { logic, schema } from "./get_list.ts";

// // Mock the API function
// import * as postsApi from "../../esa_client/posts.ts";

// Keep relative paths for project internal imports
import type { GetPostsOptions } from "../../esa_client/types.ts";
import { z } from "zod"; // Keep z for type inference if needed
import { ok } from "../../esa_client/types.ts";
import type {
    EsaPost,
    GetPostsResponse,
    // GetPostsOptions, // 削除
} from "../../esa_client/types.ts";

// Type alias for inferred schema type
type GetPostsParams = z.infer<typeof schema>;

describe("getPostsLogic", () => {
    // Remove spy setup
    // let getPostsSpy: Spy<typeof postsApi>;
    // beforeEach(() => {
    //     getPostsSpy = spy(postsApi, "getPosts");
    // });
    // afterEach(() => {
    //     restore();
    // });

    describe("getClientParams", () => {
        it("は、検証済み引数をそのままGetPostsOptionsとして返すこと", () => {
            const validatedData = { q: "test", page: 2, per_page: 50 };
            const expectedParams = validatedData;
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });

        it("引数がない場合でも空のオブジェクトを返すこと", () => {
            const validatedData = undefined; // Schema is optional
            const expectedParams = {};
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });

    // formatSuccessOutput is not implemented
    // Add tests for clientFunction if needed
});
