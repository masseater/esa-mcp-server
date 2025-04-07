import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals, assertStrictEquals } from "@std/assert";
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed

// Import the specific implementation details
import { logic, schema } from "./get_detail.ts";

// // Mock the API function
// import * as postsApi from "../../esa_client/posts.ts";

describe("getPostDetailLogic", () => {
    // Remove spy setup
    // let getPostDetailSpy: Spy<typeof postsApi>;
    // beforeEach(() => {
    //     getPostDetailSpy = spy(postsApi, "getPostDetail");
    // });
    // afterEach(() => {
    //     restore();
    // });

    describe("getClientParams", () => {
        it("は、検証済み引数からpostNumberを正しく抽出すること", () => {
            const validatedData = { post_number: 456 };
            const expectedParams = 456;
            const result = logic.getClientParams(validatedData);
            assertStrictEquals(result, expectedParams);
        });
    });

    // formatSuccessOutput is not implemented, so no tests needed
    // Add tests for clientFunction if needed
});
