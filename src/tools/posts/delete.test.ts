import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertStrictEquals } from "@std/assert";
import {
    returnsNext,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";
import { err, ok } from "../../esa_client/types.ts";
import * as postsApi from "../../esa_client/posts.ts";
import { logic } from "./delete.ts";

describe("deletePostLogic", () => {
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
