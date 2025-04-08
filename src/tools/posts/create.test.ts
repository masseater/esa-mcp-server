import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { logic, schema } from "./create.ts";
import { z } from "zod";

type CreatePostParams = z.infer<typeof schema>;

describe("createPostLogic", () => {
    describe("getClientParams", () => {
        it("は、検証済み引数を正しいCreatePostBody形式に変換すること", () => {
            const validatedData = {
                post: {
                    name: "Test Post",
                    body_md: "This is a test.",
                    tags: ["test", "esa"],
                    category: "dev",
                    wip: false,
                    message: "Creating test post",
                    user: "test_user",
                },
            };
            const expectedParams = { post: validatedData.post };
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });

        it("オプションフィールドがなくても正しく動作すること", () => {
            const validatedData = {
                post: {
                    name: "Minimal Post",
                },
            };
            const expectedParams = { post: validatedData.post };
            const result = logic.getClientParams(validatedData);
            assertEquals(result, expectedParams);
        });
    });
});
