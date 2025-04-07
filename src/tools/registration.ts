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
    // console.info("Registering esa.io tools..."); // Use console if needed, carefully

    for (const [key, impl] of Object.entries(implementations)) {
        const toolImpl = impl as EsaToolImplementation;

        if (!toolImpl.config || !toolImpl.schema || !toolImpl.logic) {
            // console.error( // Fallback to console.error, might be noisy // 削除
            //     `Tool registration skipped: Implementation for key '${key}' is incomplete (missing config, schema, or logic).`,
            // );
            // continue; // 削除
            // エラーを throw して登録プロセスを停止させるのだ
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
            // Cannot use context.log here
            // console.debug(`Registered tool: ${toolImpl.config.name}`);
        } catch (error) {
            // console.error( // Fallback to console.error // 削除
            //     `Failed to register tool '${toolImpl.config.name}' (key: ${key}): ${
            //         error instanceof Error ? error.message : error
            //     }`,
            // );
            // エラーを再 throw して問題を明確にするのだ
            throw new Error(
                `Failed to register tool '${toolImpl.config.name}' (key: ${key}): ${
                    error instanceof Error ? error.message : String(error)
                }`,
                { cause: error }, // 元のエラーを保持
            );
        }
    }
    // Cannot use context.log here
    // console.info(
    //    `Finished registering ${Object.keys(implementations).length} esa.io tools.`,
    // );
}
