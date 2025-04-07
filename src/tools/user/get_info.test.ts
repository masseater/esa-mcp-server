import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
    returnsNext,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";
import { err, ok, Result } from "../../esa_client/types.ts";
import type { EsaUser } from "../../esa_client/types.ts";
import * as userApi from "../../esa_client/user.ts";
import { logic } from "./get_info.ts"; // schema は削除済み

// // Mock the API function
// import * as userApi from "../../esa_client/user.ts";

describe("getUserInfoLogic", () => {
    // Remove spy setup
    // let getUserInfoSpy: Spy<typeof userApi>;
    // beforeEach(() => {
    //     getUserInfoSpy = spy(userApi, "getUserInfo");
    // });
    // afterEach(() => {
    //     restore();
    // });

    describe("getClientParams", () => {
        it("は、引数がない場合にundefinedを返すこと (APIクライアントが引数不要なため)", () => {
            const validatedData = {}; // Schema is z.object({})
            const expectedParams = undefined;
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });

    // formatSuccessOutput is not implemented
    // Add tests for clientFunction if needed
});
