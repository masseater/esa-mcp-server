import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertExists } from "@std/assert";
import { assertSpyCalls, restore, Spy, spy } from "@std/testing/mock";
import type { FastMCP } from "fastmcp";

// Import REAL implementations map
import { implementations } from "./implementations.ts";
import type { EsaToolImplementation } from "./types.ts";

// Function under test
import { registerEsaTools } from "./registration.ts";

describe("registerEsaTools", () => {
    let mockServer: FastMCP;
    let addToolSpy: Spy<FastMCP>;

    beforeEach(() => {
        addToolSpy = spy();
        // Provide a minimal mock for log if needed
        // Use 'as any' to align with the implementation's workaround
        mockServer = {
            addTool: addToolSpy,
            log: console as any,
        } as unknown as FastMCP;
    });

    afterEach(() => {
        restore();
    });

    it("は、implementationsマップに基づき、全てのツールを正しく登録すること", () => {
        // Act
        registerEsaTools(mockServer);

        // Assert: Check total call counts
        const expectedToolCount = Object.keys(implementations).length;
        assertSpyCalls(addToolSpy, expectedToolCount);

        // Assert: Verify arguments for each registered tool
        for (const implKey in implementations) {
            const expectedImpl =
                implementations[implKey] as EsaToolImplementation;
            const expectedConfig = expectedImpl.config;
            const expectedSchema = expectedImpl.schema;

            assertExists(expectedConfig, `Config missing for ${implKey}`);
            assertExists(expectedSchema, `Schema missing for ${implKey}`);

            // Verify addTool call
            const addToolCall = addToolSpy.calls.find(
                (call) => call.args[0]?.name === expectedConfig.name,
            );
            assertExists(
                addToolCall,
                `addTool call for ${expectedConfig.name} not found`,
            );
            const addToolArgs = addToolCall.args[0];
            assertEquals(addToolArgs.name, expectedConfig.name);
            assertEquals(addToolArgs.description, expectedConfig.description);
            assertEquals(addToolArgs.parameters, expectedSchema);
            assert(
                typeof addToolArgs.execute === "function",
                `Execute is not a function for ${expectedConfig.name}`,
            );
        }
    });
});
