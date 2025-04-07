// Standard library imports
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
    returnsNext,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";

// Import functions under test from posts.ts
import {
    createPost,
    deletePost,
    getPostDetail,
    getPosts,
    updatePost,
} from "./posts.ts";

// Import types and helpers from types.ts
import type {
    CreatePostBody,
    EsaPost,
    GetPostsOptions,
    GetPostsResponse,
    UpdatePostBody,
} from "./types.ts";
import { ok } from "./types.ts"; // ok helper is needed for assertions

// --- Test Cases for Post related functions ---

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
    const postBody: CreatePostBody = { post: { name: "", body_md: "" } }; // 不正なリクエストの例
    const result = await createPost(postBody);

    // 結果を検証 (err が返ることを期待)
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
        post: { name: "Test Post", body_md: "" },
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
    const updateBody: UpdatePostBody = { post: { name: "Test" } };
    const errorBody = JSON.stringify({
        error: "not_found",
        message: "Not Found",
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
    assertEquals(result.ok, false, "APIエラー時に ok: false が返ること");
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
    }

    fetchStub.restore();
});

Deno.test("updatePost - network error", async () => {
    const postNumber = 123;
    const updateBody: UpdatePostBody = { post: { name: "Test" } };

    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("Connection refused")),
    );

    const result = await updatePost(postNumber, updateBody);
    assertEquals(
        result.ok,
        false,
        "ネットワークエラー時に ok: false が返ること",
    );
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
        assertEquals(result.error.message, "Connection refused");
    }

    fetchStub.restore();
});

// deletePost のテストケース
Deno.test("deletePost - success", async () => {
    const postNumber = 123;

    // fetch をスタブ化し、成功レスポンス (204 No Content) を返す
    const fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext([
            Promise.resolve(
                new Response(null, {
                    status: 204, // No Content
                    statusText: "No Content",
                }),
            ),
        ]),
    );

    const result = await deletePost(postNumber);
    assertEquals(result, ok(true), "記事削除成功時に ok(true) が返ること");

    fetchStub.restore();
});

Deno.test("deletePost - invalid post number", async () => {
    const postNumber = 0;
    const result = await deletePost(postNumber);
    assertEquals(result.ok, false, "不正な記事番号で ok: false が返ること");
    if (!result.ok) {
        assertEquals(
            result.error.message,
            "Invalid post number. Must be greater than 0.",
        );
    }
});

Deno.test("deletePost - API error (e.g., 404 Not Found)", async () => {
    const postNumber = 999; // 存在しない記事番号
    const errorBody = JSON.stringify({
        error: "not_found",
        message: "Not Found",
    });

    // fetch をスタブ化し、404 Not Found を返す
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

    const result = await deletePost(postNumber);
    assertEquals(result.ok, false, "APIエラー時に ok: false が返ること");
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
    }

    fetchStub.restore();
});

Deno.test("deletePost - network error", async () => {
    const postNumber = 123;
    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("Timeout")), // ネットワークエラーを発生
    );

    const result = await deletePost(postNumber);
    assertEquals(
        result.ok,
        false,
        "ネットワークエラー時に ok: false が返ること",
    );
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
        assertEquals(result.error.message, "Timeout");
    }

    fetchStub.restore();
});

// getPosts のテストケース
Deno.test("getPosts - success (no options)", async () => {
    const mockResponse: GetPostsResponse = {
        posts: [],
        prev_page: null,
        next_page: null,
        total_count: 0,
        page: 1,
        per_page: 20,
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

    const result = await getPosts();
    assertEquals(result, ok(mockResponse), "オプション無しで成功すること");

    fetchStub.restore();
});

Deno.test("getPosts - success (with options)", async () => {
    const options: GetPostsOptions = { q: "test", page: 2, per_page: 10 };
    const mockResponse: GetPostsResponse = {
        posts: [/* 省略: 必要ならダミー記事データを入れる */],
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
        (url: string | URL | Request) => {
            const urlObj = new URL(url.toString());
            assertEquals(urlObj.searchParams.get("q"), "test");
            assertEquals(urlObj.searchParams.get("page"), "2");
            assertEquals(urlObj.searchParams.get("per_page"), "10");
            return Promise.resolve(
                new Response(JSON.stringify(mockResponse), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }),
            );
        },
    );

    const result = await getPosts(options);
    assertEquals(result, ok(mockResponse), "オプション付きで成功すること");

    fetchStub.restore();
});

Deno.test("getPosts - API error", async () => {
    const errorBody = JSON.stringify({
        error: "forbidden",
        message: "Forbidden",
    });
    const fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext([
            Promise.resolve(
                new Response(errorBody, {
                    status: 403,
                    statusText: "Forbidden",
                    headers: { "Content-Type": "application/json" },
                }),
            ),
        ]),
    );

    const result = await getPosts();
    assertEquals(result.ok, false, "APIエラー時に ok: false が返ること");
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
    }

    fetchStub.restore();
});

Deno.test("getPosts - network error", async () => {
    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("DNS lookup failed")),
    );

    const result = await getPosts();
    assertEquals(
        result.ok,
        false,
        "ネットワークエラー時に ok: false が返ること",
    );
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
        assertEquals(result.error.message, "DNS lookup failed");
    }

    fetchStub.restore();
});

// getPostDetail のテストケース
Deno.test("getPostDetail - success", async () => {
    const postNumber = 456;
    const mockResponse: EsaPost = {
        number: postNumber,
        name: "Detailed Post",
        full_name: "Detailed Post",
        wip: false,
        body_md: "Details here.",
        body_html: "<p>Details here.</p>",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        message: "Initial commit",
        url: `https://example.esa.io/posts/${postNumber}`,
        tags: [],
        category: null,
        revision_number: 1,
        created_by: {
            myself: false,
            name: "Other User",
            screen_name: "otheruser",
            icon: "icon_url2",
        },
        updated_by: {
            myself: false,
            name: "Other User",
            screen_name: "otheruser",
            icon: "icon_url2",
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

    const result = await getPostDetail(postNumber);
    assertEquals(result, ok(mockResponse), "記事詳細取得が成功すること");

    fetchStub.restore();
});

Deno.test("getPostDetail - invalid post number", async () => {
    const postNumber = -1;
    const result = await getPostDetail(postNumber);
    assertEquals(result.ok, false, "不正な記事番号で ok: false が返ること");
    if (!result.ok) {
        assertEquals(
            result.error.message,
            "Invalid post number. Must be greater than 0.",
        );
    }
});

Deno.test("getPostDetail - API error (404 Not Found)", async () => {
    const postNumber = 999;
    const errorBody = JSON.stringify({
        error: "not_found",
        message: "Not Found",
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
    assertEquals(result.ok, false, "APIエラー時に ok: false が返ること");
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
    }

    fetchStub.restore();
});

Deno.test("getPostDetail - network error", async () => {
    const postNumber = 123;
    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("Failed to connect")),
    );

    const result = await getPostDetail(postNumber);
    assertEquals(
        result.ok,
        false,
        "ネットワークエラー時に ok: false が返ること",
    );
    if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
        assertEquals(result.error.message, "Failed to connect");
    }

    fetchStub.restore();
});
