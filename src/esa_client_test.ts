import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";
import {
  createPost,
  type CreatePostBody,
  deletePost,
  type EsaPost,
  getPostDetail,
  getPosts,
  type GetPostsOptions,
  type GetPostsResponse,
  ok,
  updatePost,
  type UpdatePostBody,
} from "./esa_client.ts";

// createPost のテストケース
Deno.test("createPost - success", async () => {
  // モックするレスポンスデータ
  const mockResponse: EsaPost = {
    number: 123,
    name: "Test Post",
    full_name: "Test/Test Post",
    wip: true,
    body_md: "This is a test.",
    body_html: "<p>This is a test.</p>",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    message: "Created",
    url: "https://example.esa.io/posts/123",
    tags: ["test"],
    category: "Test",
    revision_number: 1,
    created_by: {
      myself: true,
      name: "Test User",
      screen_name: "testuser",
      icon: "icon_url",
    },
    updated_by: {
      myself: true,
      name: "Test User",
      screen_name: "testuser",
      icon: "icon_url",
    },
  };

  // fetch をスタブ化し、成功レスポンス (201 Created) を返すようにするのだ
  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 201, // Created
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  // テスト対象の関数を呼び出す
  const postBody: CreatePostBody = {
    post: { name: "Test Post", body_md: "This is a test." },
  };
  const result = await createPost(postBody);

  // 結果を検証
  assertEquals(
    result,
    ok(mockResponse),
    "記事作成が成功し、正しいResultが返ること",
  );

  // スタブを元に戻す
  fetchStub.restore();
});

Deno.test("createPost - API error", async () => {
  // モックするエラーレスポンス
  const errorBody = JSON.stringify({
    error: "invalid_parameter",
    message: "Name is required",
  });

  // fetch をスタブ化し、失敗レスポンス (400 Bad Request) を返すようにするのだ
  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(errorBody, {
          status: 400, // Bad Request
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  // テスト対象の関数を呼び出す
  const postBody: CreatePostBody = { post: { name: "" } }; // 不正なリクエストの例
  const result = await createPost(postBody);

  // 結果を検証 (err が返ることを期待)
  // エラーメッセージは API のレスポンスによって変わるので、ここでは ok: false であることと、
  // エラーオブジェクトの型をチェックするのだ
  assertEquals(
    result.ok,
    false,
    "APIエラー時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(
      result.error instanceof Error,
      true,
      "エラーオブジェクトが Error インスタンスであること",
    );
    // エラーメッセージの内容まで厳密にチェックする場合は以下のようにするのだ
    // assertEquals(result.error.message, 'API Error 400: Bad Request. Body: {"error":"invalid_parameter","message":"Name is required"}');
  }

  // スタブを元に戻す
  fetchStub.restore();
});

Deno.test("createPost - network error", async () => {
  // fetch をスタブ化し、ネットワークエラーを発生させるのだ (Errorをthrow)
  const fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.reject(new Error("Network connection failed")), // fetch自体が失敗するケース
  );

  // テスト対象の関数を呼び出す
  const postBody: CreatePostBody = {
    post: { name: "Test Post" },
  };
  const result = await createPost(postBody);

  // 結果を検証 (err が返ることを期待)
  assertEquals(
    result.ok,
    false,
    "ネットワークエラー時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(
      result.error instanceof Error,
      true,
      "エラーオブジェクトが Error インスタンスであること",
    );
    assertEquals(
      result.error.message,
      "Network connection failed",
      "ネットワークエラーのメッセージが正しく伝播すること",
    );
  }

  // スタブを元に戻す
  fetchStub.restore();
});

// updatePost のテストケース
Deno.test("updatePost - success", async () => {
  const postNumber = 123;
  const updateBody: UpdatePostBody = {
    post: { name: "Updated Title", wip: false },
  };
  const mockResponse: EsaPost = {
    number: postNumber,
    name: "Updated Title",
    full_name: "Updated Title",
    wip: false,
    body_md: "This is a test.",
    body_html: "<p>This is a test.</p>",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T01:00:00Z",
    message: "Updated post.",
    url: `https://example.esa.io/posts/${postNumber}`,
    tags: ["test"],
    category: "Test",
    revision_number: 2,
    created_by: {
      myself: true,
      name: "Test User",
      screen_name: "testuser",
      icon: "icon_url",
    },
    updated_by: {
      myself: true,
      name: "Test User",
      screen_name: "testuser",
      icon: "icon_url",
    },
  };

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await updatePost(postNumber, updateBody);
  assertEquals(
    result,
    ok(mockResponse),
    "記事更新が成功し、正しいResultが返ること",
  );

  fetchStub.restore();
});

Deno.test("updatePost - invalid post number", async () => {
  const postNumber = 0;
  const updateBody: UpdatePostBody = { post: { name: "Updated Title" } };

  const result = await updatePost(postNumber, updateBody);
  assertEquals(result.ok, false, "不正な記事番号で ok: false が返ること");
  if (!result.ok) {
    assertEquals(
      result.error.message,
      "Invalid post number. Must be greater than 0.",
    );
  }
});

Deno.test("updatePost - no update fields", async () => {
  const postNumber = 123;
  const updateBody: UpdatePostBody = { post: {} };

  const result = await updatePost(postNumber, updateBody);
  assertEquals(result.ok, false, "更新フィールド無しで ok: false が返ること");
  if (!result.ok) {
    assertEquals(result.error.message, "No update fields provided.");
  }
});

Deno.test("updatePost - API error", async () => {
  const postNumber = 123;
  const updateBody: UpdatePostBody = { post: { name: "Updated Title" } };
  const errorBody = JSON.stringify({
    error: "not_found",
    message: "Post not found",
  });

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(errorBody, {
          status: 404,
          statusText: "Not Found",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await updatePost(postNumber, updateBody);
  assertEquals(
    result.ok,
    false,
    "APIエラー時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(result.error instanceof Error, true);
  }

  fetchStub.restore();
});

// deletePost のテストケース
Deno.test("deletePost - success", async () => {
  const postNumber = 123;

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(null, { // No body for 204
          status: 204, // No Content for DELETE success
        }),
      ),
    ]),
  );

  const result = await deletePost(postNumber);
  assertEquals(result, ok(true), "記事削除が成功し、ok(true)が返ること");

  fetchStub.restore();
});

Deno.test("deletePost - invalid post number", async () => {
  const postNumber = 0;

  // fetch should not be called
  const result = await deletePost(postNumber);
  assertEquals(result.ok, false, "不正な記事番号で ok: false が返ること");
  if (!result.ok) {
    assertEquals(
      result.error.message,
      "Invalid post number. Must be greater than 0.",
    );
  }
});

Deno.test("deletePost - API error (not found)", async () => {
  const postNumber = 404;
  const errorBody = JSON.stringify({
    error: "not_found",
    message: "Post not found",
  });

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(errorBody, {
          status: 404, // Not Found
          statusText: "Not Found",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await deletePost(postNumber);
  assertEquals(
    result.ok,
    false,
    "APIエラー (404) 時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(result.error instanceof Error, true);
    // Check specific message if needed
    // assertEquals(result.error.message, 'API Error 404: Not Found. Body: ...');
  }

  fetchStub.restore();
});

// getPosts のテストケース
Deno.test("getPosts - success (no options)", async () => {
  const mockResponse: GetPostsResponse = {
    posts: [
      {/* ... mock EsaPost 1 ... */} as EsaPost,
      {/* ... mock EsaPost 2 ... */} as EsaPost,
    ],
    prev_page: null,
    next_page: 2,
    total_count: 100,
    page: 1,
    per_page: 2,
    max_per_page: 100,
  };

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await getPosts(); // No options

  // Verify fetch was called with the correct URL (without query params)
  const urlArg = fetchStub.calls[0].args[0];
  const urlString = typeof urlArg === "string"
    ? urlArg
    : (urlArg instanceof URL ? urlArg.href : "");
  assertEquals(
    urlString.endsWith("/posts"),
    true,
    "Fetch URL should end with /posts",
  );
  assertEquals(
    result,
    ok(mockResponse),
    "記事一覧取得 (オプション無) が成功すること",
  );

  fetchStub.restore();
});

Deno.test("getPosts - success (with options)", async () => {
  const options: GetPostsOptions = { q: "test", page: 2, per_page: 10 };
  const mockResponse: GetPostsResponse = {
    // ... mock response data ...
    posts: [],
    prev_page: 1,
    next_page: 3,
    total_count: 25,
    page: 2,
    per_page: 10,
    max_per_page: 100,
  };

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await getPosts(options);

  // Verify fetch was called with the correct URL and query params
  const expectedUrl = `/posts?q=test&page=2&per_page=10`;
  const urlArgWithOptions = fetchStub.calls[0].args[0];
  const urlStringWithOptions = typeof urlArgWithOptions === "string"
    ? urlArgWithOptions
    : (urlArgWithOptions instanceof URL ? urlArgWithOptions.href : "");
  assertEquals(
    urlStringWithOptions.endsWith(expectedUrl),
    true,
    `Fetch URL should end with ${expectedUrl}`,
  );
  assertEquals(
    result,
    ok(mockResponse),
    "記事一覧取得 (オプション有) が成功すること",
  );

  fetchStub.restore();
});

Deno.test("getPosts - API error", async () => {
  const errorBody = JSON.stringify({ error: "internal_server_error" });

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(errorBody, {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await getPosts();
  assertEquals(
    result.ok,
    false,
    "APIエラー時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(result.error instanceof Error, true);
  }

  fetchStub.restore();
});

// getPostDetail のテストケース
Deno.test("getPostDetail - success", async () => {
  const postNumber = 123;
  const mockResponse: EsaPost = {
    number: postNumber,
    name: "Specific Post Title",
    full_name: "Category/Specific Post Title",
    wip: false,
    body_md: "Detailed content here.",
    body_html: "<p>Detailed content here.</p>",
  } as EsaPost; // Cast for brevity in example

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await getPostDetail(postNumber);

  // Verify fetch was called with the correct URL
  const urlArg = fetchStub.calls[0].args[0];
  const urlString = typeof urlArg === "string"
    ? urlArg
    : (urlArg instanceof URL ? urlArg.href : "");
  assertEquals(urlString.endsWith(`/posts/${postNumber}`), true);
  assertEquals(result, ok(mockResponse), "記事詳細取得が成功すること");

  fetchStub.restore();
});

Deno.test("getPostDetail - invalid post number", async () => {
  const postNumber = -1;

  // fetch should not be called
  const result = await getPostDetail(postNumber);
  assertEquals(result.ok, false, "不正な記事番号で ok: false が返ること");
  if (!result.ok) {
    assertEquals(
      result.error.message,
      "Invalid post number. Must be greater than 0.",
    );
  }
});

Deno.test("getPostDetail - API error (not found)", async () => {
  const postNumber = 999;
  const errorBody = JSON.stringify({
    error: "not_found",
    message: "Post not found",
  });

  const fetchStub = stub(
    globalThis,
    "fetch",
    returnsNext([
      Promise.resolve(
        new Response(errorBody, {
          status: 404,
          statusText: "Not Found",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ]),
  );

  const result = await getPostDetail(postNumber);
  assertEquals(
    result.ok,
    false,
    "APIエラー (404) 時に ok: false の Result が返ること",
  );
  if (!result.ok) {
    assertEquals(result.error instanceof Error, true);
  }

  fetchStub.restore();
});
