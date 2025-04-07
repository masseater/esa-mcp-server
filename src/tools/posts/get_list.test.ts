import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed

// Import the specific implementation details
import { logic, schema } from "./get_list.ts";

// // Mock the API function
// import * as postsApi from "../../esa_client/posts.ts";

// Keep relative paths for project internal imports
import type { GetPostsOptions } from "../../esa_client/types.ts";
import { z } from "zod"; // Keep z for type inference if needed

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
