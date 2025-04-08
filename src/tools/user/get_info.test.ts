import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

import { logic } from "./get_info.ts";

describe("getUserInfoLogic", () => {
    describe("getClientParams", () => {
        it("は、引数がない場合にundefinedを返すこと (APIクライアントが引数不要なため)", () => {
            const validatedData = {};
            const expectedParams = undefined;
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });
});
