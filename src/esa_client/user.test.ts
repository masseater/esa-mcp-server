// Standard library imports
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
    returnsNext,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";

// Import function under test from user.ts
import { getUserInfo } from "./user.ts";

// Import types and helpers from types.ts
import type { EsaUser } from "./types.ts";
import { ok } from "./types.ts"; // ok helper for assertions

// --- Test Cases for User related functions ---

Deno.test("getUserInfo - success", async () => {
    // モックするレスポンスデータ
    const mockResponse: EsaUser = {
        id: 1,
        name: "ずんだもん",
        screen_name: "zundamon",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        icon: "https://example.com/zundamon.png",
        email: "zunda@example.com",
    };

    // fetch をスタブ化し、成功レスポンス (200 OK) を返す
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

    // テスト対象の関数を呼び出す
    const result = await getUserInfo();

    // 結果を検証
    assertEquals(
        result,
        ok(mockResponse),
        "ユーザー情報取得が成功し、正しいResultが返ること",
    );

    // スタブを元に戻す
    fetchStub.restore();
});

Deno.test("getUserInfo - API error (e.g., 401 Unauthorized)", async () => {
    // モックするエラーレスポンス
    const errorBody = JSON.stringify({
        error: "unauthorized",
        message: "Requires valid access token",
    });

    // fetch をスタブ化し、失敗レスポンス (401 Unauthorized) を返す
    const fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext([
            Promise.resolve(
                new Response(errorBody, {
                    status: 401,
                    statusText: "Unauthorized",
                    headers: { "Content-Type": "application/json" },
                }),
            ),
        ]),
    );

    // テスト対象の関数を呼び出す
    const result = await getUserInfo();

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
        // メッセージの内容も確認
        assertEquals(
            result.error.message.includes("API Error 401: Unauthorized"),
            true,
        );
    }

    // スタブを元に戻す
    fetchStub.restore();
});

Deno.test("getUserInfo - network error", async () => {
    // fetch をスタブ化し、ネットワークエラーを発生させる
    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("Could not resolve host")),
    );

    // テスト対象の関数を呼び出す
    const result = await getUserInfo();

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
            "Could not resolve host",
            "ネットワークエラーのメッセージが正しく伝播すること",
        );
    }

    // スタブを元に戻す
    fetchStub.restore();
});
