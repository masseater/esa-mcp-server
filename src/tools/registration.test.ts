import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertExists } from "@std/assert";
import { assertSpyCalls, restore, Spy, spy } from "@std/testing/mock";
import type { FastMCP } from "fastmcp/mod.ts";

import { implementations } from "./implementations.ts";
import { registerEsaTools } from "./registration.ts";

const createMockLogger = () => ({
    debug: spy(),
    error: spy(),
    info: spy(),
    warn: spy(),
});

describe("registerEsaTools", () => {
    let mockServer: FastMCP;
    let addToolSpy: Spy<FastMCP>;

    beforeEach(() => {
        addToolSpy = spy();
        mockServer = {
            addTool: addToolSpy,
            log: createMockLogger(),
        } as unknown as FastMCP;
    });

    afterEach(() => {
        restore();
    });

    it("は、implementationsマップに基づき、全てのツールを正しく登録すること", () => {
        registerEsaTools(mockServer);

        const expectedToolCount = Object.keys(implementations).length;
        assertSpyCalls(addToolSpy, expectedToolCount);

        (Object.keys(implementations) as Array<keyof typeof implementations>)
            .forEach(
                (implKey) => {
                    const expectedImpl = implementations[implKey];
                    const expectedConfig = expectedImpl.config;
                    const expectedSchema = expectedImpl.schema;

                    assertExists(
                        expectedConfig,
                        `Config missing for ${implKey}`,
                    );
                    assertExists(
                        expectedSchema,
                        `Schema missing for ${implKey}`,
                    );

                    const addToolCall = addToolSpy.calls.find(
                        (call) => call.args[0]?.name === expectedConfig.name,
                    );
                    assertExists(
                        addToolCall,
                        `addTool call for ${expectedConfig.name} not found`,
                    );
                    const addToolArgs = addToolCall.args[0];
                    assertEquals(addToolArgs.name, expectedConfig.name);
                    assertEquals(
                        addToolArgs.description,
                        expectedConfig.description,
                    );
                    assertEquals(addToolArgs.parameters, expectedSchema);
                    assert(
                        typeof addToolArgs.execute === "function",
                        `Execute is not a function for ${expectedConfig.name}`,
                    );
                },
            );
    });
});
