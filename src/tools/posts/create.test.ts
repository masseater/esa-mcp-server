import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed here
import { z } from "zod";
import type { CreatePostBody, Result } from "../../esa_client/types.ts"; // Correct path
import { ok } from "../../esa_client/types.ts";

// Import the specific implementation details
import { logic, schema } from "./create.ts";

// // Mock the API function directly if needed for isolation
// import * as postsApi from "../../esa_client/posts.ts";

// Type alias for inferred schema type
type CreatePostParams = z.infer<typeof schema>;

describe("createPostLogic", () => {
    // Remove spy setup
    // let createPostSpy: Spy<typeof postsApi>;
    // beforeEach(() => {
    //     createPostSpy = spy(postsApi, "createPost");
    // });
    // afterEach(() => {
    //     restore();
    // });

    describe("getClientParams", () => {
        it("は、検証済み引数を正しいCreatePostBody形式に変換すること", () => {
            const validatedData = {
                post: {
                    name: "Test Post",
                    body_md: "This is a test.",
                    tags: ["test", "esa"],
                    category: "dev",
                    wip: false,
                    message: "Creating test post",
                    user: "test_user",
                },
            };
            const expectedParams = { post: validatedData.post };
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });

        it("オプションフィールドがなくても正しく動作すること", () => {
            const validatedData = {
                post: {
                    name: "Minimal Post",
                },
            };
            // Ensure default wip is handled correctly if schema defines it
            const expectedParams = { post: validatedData.post };
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });

    // formatSuccessOutput is implemented, add tests if needed
    // describe("formatSuccessOutput", () => { ... });
});
