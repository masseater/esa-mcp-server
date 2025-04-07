import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertStrictEquals } from "@std/assert";
import { returnsNext, stub } from "@std/testing/mock";
import { err, ok, Result } from "../../esa_client/types.ts";
import type { EsaPost } from "../../esa_client/types.ts";
import * as postsApi from "../../esa_client/posts.ts";
import { logic /*, schema*/ } from "./get_detail.ts"; // schema を削除

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
