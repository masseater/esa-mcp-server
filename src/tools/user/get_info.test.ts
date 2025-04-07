import {
    describe,
    it,
    // beforeEach, // Remove spy setup
    // afterEach,
} from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
// import { spy, Spy, assertSpyCalls, restore } from "@std/testing/mock"; // No spies needed

// Import the specific implementation details
import { logic, schema } from "./get_info.ts";

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
