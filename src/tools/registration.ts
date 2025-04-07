import type { FastMCP } from "fastmcp";
import { implementations } from "./implementations.ts";
import { createEsaToolExecutor } from "./common_executor.ts";
import { EsaToolImplementation } from "./types.ts";

/**
 * Registers all defined esa.io tools with the FastMCP server.
 * Iterates through the implementations map and adds each tool.
 */
export function registerEsaTools(server: FastMCP): void {
    // Logging during registration is not possible via context.log

    for (const [key, impl] of Object.entries(implementations)) {
        const toolImpl = impl as EsaToolImplementation;

        if (!toolImpl.config || !toolImpl.schema || !toolImpl.logic) {
            throw new Error(
                `Tool registration failed: Implementation for key '${key}' is incomplete (missing config, schema, or logic).`,
            );
        }

        try {
            server.addTool({
                name: toolImpl.config.name,
                description: toolImpl.config.description,
                parameters: toolImpl.schema,
                execute: createEsaToolExecutor({
                    toolName: toolImpl.config.name,
                    apiFn: toolImpl.logic.apiFn,
                    getClientParams: toolImpl.logic.getClientParams,
                    formatSuccessOutput: toolImpl.logic.formatSuccessOutput,
                }),
            });
        } catch (error) {
            throw new Error(
                `Failed to register tool '${toolImpl.config.name}' (key: ${key}): ${
                    error instanceof Error ? error.message : String(error)
                }`,
                { cause: error },
            );
        }
    }
}
