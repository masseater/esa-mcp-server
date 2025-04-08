import { describe, it } from "@std/testing/bdd";
import { assertStrictEquals } from "@std/assert";
import { logic } from "./get_detail.ts";

describe("getPostDetailLogic", () => {
    describe("getClientParams", () => {
        it("は、検証済み引数からpostNumberを正しく抽出すること", () => {
            const validatedData = { post_number: 456 };
            const expectedParams = 456;
            const result = logic.getClientParams(validatedData);
            assertStrictEquals(result, expectedParams);
        });
    });
});
