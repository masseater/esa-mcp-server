import { assertEquals, assertExists, assert } from "std/assert/mod.ts";
// import { add } from "./main.ts"; // 不要なので削除
import { getUserInfo, EsaUser, esaClientConfig } from "./esa_client.ts";

/* 不要なので削除
Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
*/

// Result 型を使うヘルパー (テスト用)
function assertOk<T, E>(
  result: { ok: true; value: T } | { ok: false; error: E },
  msg?: string
): asserts result is { ok: true; value: T } {
  assert(
    result.ok,
    msg ??
      `Expected result to be ok, but got error: ${JSON.stringify(
        (result as { ok: false; error: E }).error
      )}`
  );
}

Deno.test(
  "getUserInfo should fetch the authenticated user's information from esa.io API",
  async () => {
    // -- Arrange (準備) --
    // .env ファイルが正しく設定されている前提

    // -- Act (実行) --
    const result = await getUserInfo();

    // -- Assert (検証) --
    assertOk(result, "API呼び出しが成功すること (result.ok === true)");

    // result.ok === true なので、result.value にアクセスできる
    const user = result.value;

    // 詳細なプロパティの存在チェック
    assertExists(user.id, "ユーザーID (id) が存在すること");
    assertExists(
      user.screen_name,
      "スクリーンネーム (screen_name) が存在すること"
    );
    assertExists(user.email, "メールアドレス (email) が存在すること");
    assertExists(user.icon, "アイコンURL (icon) が存在すること");
    assertExists(user.created_at, "作成日時 (created_at) が存在すること");
    assertExists(user.updated_at, "更新日時 (updated_at) が存在すること");

    // 型のチェック
    assertEquals(
      typeof user.id,
      "number",
      "ユーザーID (id) が数値型であること"
    );
    assertEquals(
      typeof user.screen_name,
      "string",
      "スクリーンネーム (screen_name) が文字列型であること"
    );
    assertEquals(
      typeof user.email,
      "string",
      "メールアドレス (email) が文字列型であること"
    );

    console.log(
      `✅ [Test Success] User info fetched: ${user.screen_name} (${user.email})`
    );
  }
);

// 必要であれば、異常系のテストも追加できるのだ (例: トークンが無効な場合など)
// Deno.test("getUserInfo should return null if API token is invalid", async () => {
//   // Arrange: 無効なトークンを設定するなどの準備
//   // Act: getUserInfo() を実行
//   // Assert: 結果が null であることを確認
// });

// 異常系のテスト (例: 不正なトークン)
// Deno.test("getUserInfo should return an error result for invalid token", async () => {
//   // Arrange: 無効なトークンを使うように一時的に設定を書き換えるなどの工夫が必要
//   const originalToken = Deno.env.get("ESA_TOKEN");
//   const invalidConfig = { ...esaClientConfig, headers: { ...esaClientConfig.headers, Authorization: "Bearer invalid" } };
//   // 注意: このままだと getUserInfo 内部の esaClientConfig を直接書き換えられない
//   //       テストのために関数を変更するか、DI (依存性の注入) が必要になるかも。
//   //       今回は簡単のためスキップするのだ。
//   console.warn("Skipping invalid token test for getUserInfo.");
//
//   // Act
//   // const result = await getUserInfo(); // (DIが必要)
//
//   // Assert
//   // assert(!result.ok, "結果がエラー (ok=false) であること");
//   // assert(result.error instanceof Error, "エラーが Error オブジェクトであること");
//   // assertEquals(result.error.message.includes("401 Unauthorized"), true, "エラーメッセージに 401 が含まれること");
// });
