import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { assertSpyCalls, restore, spy, stub } from "@std/testing/mock";
import { z } from "zod";
import { err, ok, Result } from "../esa_client/types.ts";
import { createEsaToolExecutor } from "./common_executor.ts";
import type { Context } from "fastmcp";
import { esaClientConfig } from "../esa_client/config.ts";
import type { ApiFunction } from "./types.ts";

type EsaToolContext = Context<undefined>;

const createMockLogger = () => ({
    debug: spy(),
    error: spy(),
    info: spy(),
    warn: spy(),
});

const createMockContext = (
    mockLogger: ReturnType<typeof createMockLogger>,
): EsaToolContext => ({
    session: undefined,
    reportProgress: spy(),
    log: mockLogger,
});

const testSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
});
type TestSchemaInput = z.infer<typeof testSchema>;

const mockFetch = (
    input: string | URL | Request,
    init?: RequestInit,
): Promise<Response> => {
    const url = input instanceof URL
        ? input.href
        : input instanceof Request
        ? input.url
        : String(input);
    const method = init?.method?.toUpperCase() ??
        (input instanceof Request ? input.method.toUpperCase() : "GET");

    if (url.endsWith("/test/success") && method === "POST") {
        return Promise.resolve(
            new Response(JSON.stringify({ data: "Mocked fetch success!" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        );
    }

    if (url.endsWith("/test/formatter") && method === "POST") {
        return Promise.resolve(
            new Response(JSON.stringify({ data: "Formatted Data" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        );
    }

    if (url.endsWith("/test/api_error") && method === "POST") {
        return Promise.resolve(
            new Response(JSON.stringify({ message: "Mock API Failed" }), {
                status: 500,
                statusText: "Internal Server Error",
                headers: { "Content-Type": "application/json" },
            }),
        );
    }

    if (url.endsWith("/test/network_error")) {
        return Promise.reject(new Error("Simulated network failure"));
    }

    return Promise.resolve(new Response("Not Found", { status: 404 }));
};

describe("createEsaToolExecutor", () => {
    let mockLogger: ReturnType<typeof createMockLogger>;
    let mockContext: EsaToolContext;

    beforeEach(() => {
        mockLogger = createMockLogger();
        mockContext = createMockContext(mockLogger);
        stub(globalThis, "fetch", mockFetch);
    });

    afterEach(() => {
        restore();
    });

    it("成功時: 実際のapiFn(fetchをモック)を呼び出し、結果を返し、ログを出力する", async () => {
        const testApiFn = async (
            params: { value: number },
        ): Promise<Result<{ data: string }, Error>> => {
            const response = await fetch(
                `${esaClientConfig.baseUrl}/test/success`,
                {
                    method: "POST",
                    body: JSON.stringify(params),
                },
            );
            if (!response.ok) {
                return err(new Error(`API Error ${response.status}`));
            }
            const data = await response.json();
            return ok(data);
        };

        const getClientParamsFn = spy((validatedData: TestSchemaInput) => ({
            value: validatedData.id,
        }));

        const executor = createEsaToolExecutor({
            toolName: "testToolSuccessFetch",
            apiFn: testApiFn,
            getClientParams: getClientParamsFn,
        });

        const result = await executor({ id: 10 }, mockContext);

        assertSpyCalls(getClientParamsFn, 1);

        assertEquals(result, JSON.stringify({ data: "Mocked fetch success!" }));

        assertSpyCalls(mockLogger.info, 2);
        assertSpyCalls(mockLogger.debug, 2);
        assertSpyCalls(mockLogger.error, 0);

        assertStringIncludes(
            mockLogger.info.calls[0].args[0],
            "Executing tool: testToolSuccessFetch",
        );

        assertStringIncludes(
            mockLogger.info.calls[1].args[0],
            "Execution successful",
        );
    });

    it("成功時(カスタムフォーマッタ): fetchモックとフォーマッタで結果を返す", async () => {
        const testApiFn = async (
            params: { value: number },
        ): Promise<Result<{ data: string }, Error>> => {
            const response = await fetch(
                `${esaClientConfig.baseUrl}/test/formatter`,
                {
                    method: "POST",
                    body: JSON.stringify(params),
                },
            );
            if (!response.ok) {
                return err(new Error(`API Error ${response.status}`));
            }
            return ok(await response.json());
        };
        const getClientParamsFn = spy((validatedData: TestSchemaInput) => ({
            value: validatedData.id,
        }));
        const formatSuccessFn = spy((result: { data: string }) => {
            return `Formatted: ${result.data}`;
        });

        const executor = createEsaToolExecutor({
            toolName: "testToolFormatterFetch",
            apiFn: testApiFn,
            getClientParams: getClientParamsFn,
            formatSuccessOutput: formatSuccessFn,
        });

        const result = await executor({ id: 5, name: "test" }, mockContext);

        assertSpyCalls(getClientParamsFn, 1);
        assertSpyCalls(formatSuccessFn, 1);
        assertEquals(formatSuccessFn.calls[0].args[0], {
            data: "Formatted Data",
        });
        assertEquals(result, "Formatted: Formatted Data");

        assertSpyCalls(mockLogger.info, 2);
        assertSpyCalls(mockLogger.debug, 2);
        assertSpyCalls(mockLogger.error, 0);
    });

    it("APIエラー時(fetchモック): エラーをthrowし、errorログを出力する", async () => {
        const testApiFn = async (
            params: null | undefined,
        ): Promise<Result<string, Error>> => {
            const response = await fetch(
                `${esaClientConfig.baseUrl}/test/api_error`,
                {
                    method: "POST",
                    body: JSON.stringify(params),
                },
            );

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({
                    message: "Unknown error format",
                }));
                return err(
                    new Error(
                        errorBody.message || `API Error ${response.status}`,
                    ),
                );
            }
            return ok(await response.json());
        };
        const getClientParamsFn = spy(
            (_validatedData: TestSchemaInput): null | undefined => null,
        );

        const executor = createEsaToolExecutor({
            toolName: "testToolApiErrorFetch",
            apiFn: testApiFn,
            getClientParams: getClientParamsFn,
        });

        await assertRejects(
            async () => {
                await executor({ id: 1 }, mockContext);
            },
            Error,
            "API call failed for testToolApiErrorFetch: Mock API Failed",
        );
        assertSpyCalls(getClientParamsFn, 1);

        assertSpyCalls(mockLogger.info, 1);
        assertSpyCalls(mockLogger.debug, 2);
        assertSpyCalls(mockLogger.error, 1);
        assertStringIncludes(
            mockLogger.error.calls[0].args[0],
            "API Error: Mock API Failed",
        );
    });

    it("ネットワークエラー時(fetchモック): エラーをthrowし、errorログを出力する", async () => {
        const testApiFn = async (): Promise<Result<string, Error>> => {
            await fetch(`${esaClientConfig.baseUrl}/test/network_error`);
            return ok("Should not reach here");
        };
        const getClientParamsFn = spy((validatedData: TestSchemaInput) => ({
            id: validatedData.id,
        }));

        const executor = createEsaToolExecutor({
            toolName: "testToolNetworkErrorFetch",
            apiFn: testApiFn,
            getClientParams: getClientParamsFn,
        });

        await assertRejects(
            async () => {
                await executor({ id: 2 }, mockContext);
            },
            Error,
            "Simulated network failure",
        );
        assertSpyCalls(getClientParamsFn, 1);

        assertSpyCalls(mockLogger.info, 1);
        assertSpyCalls(mockLogger.debug, 1);
        assertSpyCalls(mockLogger.error, 1);
        assertStringIncludes(
            mockLogger.error.calls[0].args[0],
            "Unexpected error during testToolNetworkErrorFetch execution: Simulated network failure",
        );
    });

    it("予期せぬエラー時(getClientParams throw): エラーをthrowし、errorログを出力する", async () => {
        const paramsError = new Error("Params creation failed");
        const mockApiFn = spy();
        const getClientParamsFn = spy((_validatedData: TestSchemaInput) => {
            throw paramsError;
        });

        const executor = createEsaToolExecutor({
            toolName: "testToolParamError",
            apiFn: mockApiFn as unknown as ApiFunction<unknown, unknown>,
            getClientParams: getClientParamsFn,
        });

        await assertRejects(
            async () => {
                await executor({ id: 3 }, mockContext);
            },
            Error,
            "Parameter preparation failed for testToolParamError: Params creation failed",
        );
        assertSpyCalls(getClientParamsFn, 1);
        assertSpyCalls(mockApiFn, 0);

        assertSpyCalls(mockLogger.info, 1);
        assertSpyCalls(mockLogger.debug, 0);
        assertSpyCalls(mockLogger.error, 1);
        assertStringIncludes(
            mockLogger.error.calls[0].args[0],
            "Error preparing client params for testToolParamError: Params creation failed",
        );
    });
});
