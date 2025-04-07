import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
    returnsNext,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";

import { getUserInfo } from "./user.ts";

import type { EsaUser } from "./types.ts";
import { ok } from "./types.ts";

Deno.test("getUserInfo - success", async () => {
    const mockResponse: EsaUser = {
        id: 1,
        name: "ずんだもん",
        screen_name: "zundamon",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        icon: "https://example.com/zundamon.png",
        email: "zunda@example.com",
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

    const result = await getUserInfo();

    assertEquals(
        result,
        ok(mockResponse),
        "ユーザー情報取得が成功し、正しいResultが返ること",
    );

    fetchStub.restore();
});

Deno.test("getUserInfo - API error (e.g., 401 Unauthorized)", async () => {
    const errorBody = JSON.stringify({
        error: "unauthorized",
        message: "Requires valid access token",
    });

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

    const result = await getUserInfo();

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

        assertEquals(
            result.error.message.includes("API Error 401: Unauthorized"),
            true,
        );
    }

    fetchStub.restore();
});

Deno.test("getUserInfo - network error", async () => {
    const fetchStub = stub(
        globalThis,
        "fetch",
        () => Promise.reject(new Error("Could not resolve host")),
    );

    const result = await getUserInfo();

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

    fetchStub.restore();
});
