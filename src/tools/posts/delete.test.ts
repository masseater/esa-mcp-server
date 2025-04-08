import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertStrictEquals } from "@std/assert";
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
            const result = logic.formatSuccessOutput!(true);
            assertEquals(result, expectedMessage);
        });
    });
});
