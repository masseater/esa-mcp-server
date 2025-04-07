import {
  assertEquals,
  assertExists,
  assert,
  assertArrayIncludes, // 配列チェック用
} from "std/assert/mod.ts";
// import { add } from "./main.ts"; // 不要なので削除
import {
  getUserInfo,
  EsaUser,
  esaClientConfig, // テスト内で使うかも
  getPosts, // 今回追加
  GetPostsOptions, // 今回追加
  GetPostsResponse, // 今回追加
  EsaPost, // 今回追加
  Result, // Result 型
  ok, // ok ヘルパー
  err, // err ヘルパー
  getPostDetail, // 今回追加
  createPost, // 今回追加
  CreatePostBody, // 今回追加
} from "./esa_client.ts";

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

// --- ここから getPosts のテスト ---

Deno.test("getPosts should fetch the first page of posts", async () => {
  // Arrange
  const options: GetPostsOptions = {}; // オプションなし

  // Act
  const result = await getPosts(options);

  // Assert
  assertOk(result, "記事一覧の取得が成功すること (result.ok === true)");

  const response = result.value;
  assertExists(response.posts, "posts 配列が存在すること");
  assert(Array.isArray(response.posts), "posts が配列であること");
  assertExists(response.total_count, "total_count が存在すること");
  assertEquals(
    typeof response.total_count,
    "number",
    "total_count が数値であること"
  );
  assertEquals(response.page, 1, "デフォルトで1ページ目が取得されること"); // デフォルトは1のはず

  // 最初の記事だけでも構造をチェック
  if (response.posts.length > 0) {
    const post = response.posts[0];
    assertExists(post.number, "記事番号 (number) が存在すること");
    assertExists(post.name, "記事名 (name) が存在すること");
    assertExists(post.created_by, "作成者情報 (created_by) が存在すること");
    assertEquals(typeof post.number, "number");
    assertEquals(typeof post.name, "string");
  }

  console.log(
    `✅ [Test Success] Fetched ${response.posts.length} posts (Total: ${response.total_count}) on page ${response.page}.`
  );
});

Deno.test("getPosts should fetch posts with options (per_page)", async () => {
  // Arrange
  const options: GetPostsOptions = { per_page: 5 }; // 1ページあたり5件

  // Act
  const result = await getPosts(options);

  // Assert
  assertOk(result, "オプション付きの記事一覧取得が成功すること");

  const response = result.value;
  assert(
    response.posts.length <= 5,
    "取得した記事数が per_page (5) 以下であること"
  );
  assertEquals(
    response.per_page,
    5,
    "レスポンスの per_page が指定通りであること"
  );
  assertEquals(response.page, 1, "ページ番号が1であること"); // ページ指定なしなので1

  console.log(
    `✅ [Test Success] Fetched ${response.posts.length} posts with per_page=5.`
  );
});

// --- ここまで getPosts のテスト ---

// --- ここから getPostDetail のテスト ---

Deno.test(
  "getPostDetail should fetch a specific post by its number",
  async () => {
    // Arrange
    const postNumberToFetch = 1; // !!!注意!!! ここは実際に存在する記事番号に置き換える必要があるかも！

    // Act
    const result = await getPostDetail(postNumberToFetch);

    // Assert
    assertOk(result, `記事詳細(No.${postNumberToFetch})の取得が成功すること`);

    const post = result.value;
    assertEquals(
      post.number,
      postNumberToFetch,
      "取得した記事の番号が指定した番号と一致すること"
    );
    assertExists(post.name, "記事名 (name) が存在すること");
    assertExists(post.body_md, "Markdown本文 (body_md) が存在すること");
    assertExists(post.created_at, "作成日時 (created_at) が存在すること");
    assertExists(post.url, "記事URL (url) が存在すること");

    console.log(
      `✅ [Test Success] Fetched post detail: #${post.number} "${post.name}"`
    );
  }
);

Deno.test(
  "getPostDetail should return an error for an invalid post number (e.g., 0)",
  async () => {
    // Arrange
    const invalidPostNumber = 0;

    // Act
    const result = await getPostDetail(invalidPostNumber);

    // Assert
    assert(
      !result.ok,
      "不正な記事番号ではエラーが返ること (result.ok === false)"
    );
    assert(
      result.error instanceof Error,
      "エラーが Error オブジェクトであること"
    );
    assert(
      result.error.message.includes("Invalid post number"),
      "エラーメッセージに'Invalid post number'が含まれること"
    );

    console.log(
      `✅ [Test Success] Correctly handled invalid post number: ${invalidPostNumber}`
    );
  }
);

Deno.test(
  "getPostDetail should return an error for a non-existent post number",
  async () => {
    // Arrange
    const nonExistentPostNumber = 99999999; // 存在しないであろう非常に大きな番号

    // Act
    const result = await getPostDetail(nonExistentPostNumber);

    // Assert
    assert(!result.ok, "存在しない記事番号ではエラーが返ること");
    assert(result.error instanceof Error);
    // 404 Not Found が返ってくるはず
    assert(
      result.error.message.includes("API Error 404"),
      "エラーメッセージに 'API Error 404' が含まれること"
    );

    console.log(
      `✅ [Test Success] Correctly handled non-existent post number: ${nonExistentPostNumber}`
    );
  }
);

// --- ここまで getPostDetail のテスト ---

// --- ここから createPost のテスト ---

Deno.test("createPost should create a new post on esa.io", async () => {
  // Arrange
  const timestamp = new Date().toISOString(); // ユニークなタイトルにするためタイムスタンプを使用
  const postData: CreatePostBody = {
    post: {
      name: `[Test] New Post via API ${timestamp}`,
      body_md: `# Test Post Body\n\nThis post was created by an automated test at ${timestamp}.\n\nPlease delete this post if found.`,
      tags: ["test", "api-created"],
      category: "TestCategory/SubCategory",
      wip: true, // WIPとして作成
      message: "Creating a test post via API",
    },
  };

  // Act
  const result = await createPost(postData);

  // Assert
  assertOk(result, "記事の作成が成功すること (result.ok === true)");

  const createdPost = result.value;
  assertExists(createdPost.number, "作成された記事の番号が存在すること");
  assertEquals(
    createdPost.name,
    postData.post.name,
    "作成された記事のタイトルが指定通りであること"
  );
  // 本文は API 側で若干加工される可能性があるので、完全一致ではなく部分一致などで確認するのが無難かも
  assert(
    createdPost.body_md?.includes("This post was created by an automated test"),
    "作成された記事の本文に指定した内容が含まれること"
  );
  assertEquals(createdPost.wip, true, "WIP フラグが指定通りであること"); // wip: true を指定したので
  assertArrayIncludes(
    createdPost.tags,
    ["test", "api-created"],
    "タグが指定通りであること"
  );
  assertEquals(
    createdPost.category,
    postData.post.category,
    "カテゴリが指定通りであること"
  );

  console.log(
    `✅ [Test Success] Post created: #${createdPost.number} "${createdPost.name}"`
  );

  // TODO: クリーンアップ処理を追加する？ (作成した記事を削除するなど)
  //       今は手動で削除する必要があるのだ。
});

/* // name が必須プロパティのため、型エラーになるテストケース。
   // createPost 関数の冒頭でチェックしているので、一旦コメントアウト。
Deno.test("createPost should return an error if post title is missing", async () => {
    // Arrange
    const invalidPostData: CreatePostBody = {
        post: {
            // name を意図的に省略
            body_md: "Body without title",
        }
    };

    // Act
    const result = await createPost(invalidPostData as any); // as any で一時的に型エラー回避も可能だが...

    // Assert
    assert(!result.ok, "タイトルがない場合はエラーが返ること");
    assert(result.error instanceof Error);
    assert(
        result.error.message.includes("Post title (name) is required"),
        "エラーメッセージに\'Post title (name) is required\'が含まれること"
    );

    console.log(
        `✅ [Test Success] Correctly handled missing post title.`
    );
});
*/

// --- ここまで createPost のテスト ---
