import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { logic, schema } from "./get_list.ts";
import { z } from "zod";

type GetPostsParams = z.infer<typeof schema>;

describe("getPostsLogic", () => {
    describe("getClientParams", () => {
        it("は、検証済み引数をそのままGetPostsOptionsとして返すこと", () => {
            const validatedData = { q: "test", page: 2, per_page: 50 };
            const expectedParams = validatedData;
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });

        it("引数がない場合でも空のオブジェクトを返すこと", () => {
            const validatedData = undefined;
            const expectedParams = {};
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });
});
