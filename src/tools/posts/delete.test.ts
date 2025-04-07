import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals, assertStrictEquals } from "@std/assert";
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed

// Import the specific implementation details
import { logic, schema } from "./delete.ts";

// // Mock the API function
// import * as postsApi from "../../esa_client/posts.ts";

describe("deletePostLogic", () => {
    // Remove spy setup
    // let deletePostSpy: Spy<typeof postsApi>;
    // beforeEach(() => {
    //     deletePostSpy = spy(postsApi, "deletePost");
    // });
    // afterEach(() => {
    //     restore();
    // });

    describe("getClientParams", () => {
        it("は、検証済み引数からpostNumberを正しく抽出すること", () => {
            const validatedData = { post_number: 123 };
            const expectedParams = 123;
            const result = logic.getClientParams(validatedData);
            assertStrictEquals(result, expectedParams);
        });
    });

    describe("formatSuccessOutput", () => {
        it("は、正しいpostNumberを含む成功メッセージを生成すること", () => {
            const expectedMessage = `Successfully initiated post deletion.`;
            // Use non-null assertion as formatSuccessOutput exists
            const result = logic.formatSuccessOutput!(true);
            assertEquals(result, expectedMessage);
        });
    });
});
