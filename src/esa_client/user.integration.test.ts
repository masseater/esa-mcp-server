// src/esa_client/user.integration.test.ts
import { assertEquals, assertExists } from "@std/assert"; // assertEquals も復元
import { loadSync } from "dotenv";
import { getUserInfo } from "./user.ts";

// テスト実行前に .env を読み込んで環境変数に反映
loadSync({ export: true });

Deno.test("Integration: getUserInfo should fetch actual user data", async () => {
    // 環境変数 ESA_TEAM_NAME と ESA_TOKEN が設定されていることを前提とする
    const teamName = Deno.env.get("ESA_TEAM_NAME");
    const token = Deno.env.get("ESA_TOKEN");
    assertExists(teamName, "ESA_TEAM_NAME environment variable must be set");
    assertExists(token, "ESA_TOKEN environment variable must be set");

    const result = await getUserInfo();

    // アサーション: 成功したか (ok === true)
    assertEquals(
        result.ok,
        true,
        `API call failed: ${
            result.ok === false ? result.error.message : "Unknown error"
        }`,
    );

    // アサーション: 取得した値に必要なプロパティが存在するか (assertExists を使用)
    if (result.ok) {
        assertExists(result.value.id, "User ID should exist");
        assertExists(result.value.name, "User name should exist");
        assertExists(result.value.screen_name, "User screen_name should exist");
        assertExists(result.value.email, "User email should exist");
        assertExists(result.value.icon, "User icon URL should exist");
    }
});
