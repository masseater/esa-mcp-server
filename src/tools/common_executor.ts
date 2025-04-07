import { z, ZodSchema } from "zod";
import { Result } from "../esa_client/types.ts";
import type { ApiFunction } from "./types.ts";
import type { Context, FastMCP } from "fastmcp";

// Type for the function that transforms validated args to client function params
type GetClientParamsFn<Schema extends ZodSchema<any>, ClientParams> = (
    validatedArgs: z.infer<Schema>,
) => ClientParams | undefined;

// Type for the underlying esa.io client function
// type ClientFunction<ClientParams, ClientResult> = (
//     params: ClientParams,
// ) => Promise<Result<ClientResult, Error>>;

// Type for the function that formats the successful result
type FormatSuccessOutputFn<Schema extends z.ZodSchema<any>, ClientResult> = (
    resultValue: ClientResult,
    // validatedArgs: z.infer<Schema>, // validatedArgs might not be needed here
) => string;

// Options for the executor creator
interface CreateExecutorOptions<
    Schema extends z.ZodTypeAny, // Use ZodTypeAny which is more general
    ClientResult,
    ClientParams,
> {
    toolName: string;
    apiFn: ApiFunction<ClientParams, ClientResult>;
    getClientParams: (
        validatedData: z.infer<Schema>,
    ) => ClientParams | undefined;
    formatSuccessOutput?: (result: ClientResult) => string;
}

// Define a type alias for the specific context we expect (no auth)
type EsaToolContext = Context<undefined>;

// Type for the returned execute function - use EsaToolContext
type ExecuteFunction<Schema extends z.ZodTypeAny> = (
    validatedArgs: z.infer<Schema>,
    context: EsaToolContext,
) => Promise<string>;

/**
 * Creates the `execute` function for an esa.io tool, handling common logic.
 *
 * @param options Configuration for creating the executor.
 * @returns The async execute function to be used with `server.addTool`.
 */
export function createEsaToolExecutor<
    Schema extends z.ZodTypeAny, // Use ZodTypeAny
    ClientResult,
    ClientParams,
>(
    options: CreateExecutorOptions<Schema, ClientResult, ClientParams>,
): ExecuteFunction<Schema> {
    const {
        toolName,
        apiFn,
        getClientParams,
        formatSuccessOutput = (resultValue) => JSON.stringify(resultValue),
    } = options;

    return async (validatedArgs, context): Promise<string> => {
        const log = context.log;
        let argsForLog: string;
        try {
            argsForLog = JSON.stringify(validatedArgs);
        } catch {
            argsForLog = "[unloggable arguments]";
        }
        log.info(`Executing tool: ${toolName} with args: ${argsForLog}`);

        // 1. Prepare Parameters (can throw)
        let clientParams: ClientParams | undefined;
        try {
            clientParams = getClientParams(validatedArgs);
            log.debug(`[${toolName}] Prepared client params.`);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            log.error(
                `Error preparing client params for ${toolName}: ${errorMessage}`,
            );
            // Throw specific error for param failure
            throw new Error(
                `Parameter preparation failed for ${toolName}: ${errorMessage}`,
            );
        }

        // 2. Call API and Handle Result/Errors (can throw)
        try {
            let result: Result<ClientResult, Error>;
            // Special handling for updatePost
            if (toolName === "mcp_esa_server_update_post") {
                const updateParams = clientParams as {
                    postNumber: number;
                    body: any;
                };
                if (!updateParams) {
                    // This case should ideally be caught by schema validation
                    // or getClientParams, but added defense here.
                    throw new Error(
                        "Internal error: Client params undefined for updatePost despite preparation.",
                    );
                }
                const specificApiFn = apiFn as unknown as (
                    postNumber: number,
                    body: any,
                ) => Promise<Result<ClientResult, Error>>;
                result = await specificApiFn(
                    updateParams.postNumber,
                    updateParams.body,
                );
            } else {
                result = await apiFn(clientParams as ClientParams);
            }

            log.debug(
                `[${toolName}] API call completed. Result ok: ${result.ok}`,
            );

            if (result.ok) {
                const output = formatSuccessOutput(result.value);
                log.info(
                    `[${toolName}] Execution successful. Output length: ${
                        output?.length ?? 0
                    }`,
                );
                return output; // Success path
            } else {
                // API returned an error Result
                log.error(
                    `[${toolName}] API Error: ${result.error.message}`,
                ); // Log API error
                // Throw specific error for API failure
                throw new Error(
                    `API call failed for ${toolName}: ${result.error.message}`,
                );
            }
        } catch (error) {
            // Catch errors from API call (network etc.) OR the re-thrown errors above
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);

            // Check if the error message indicates it was already logged specifically
            const alreadyLogged = errorMessage.startsWith(
                `Parameter preparation failed for ${toolName}:`,
            ) ||
                errorMessage.startsWith(`API call failed for ${toolName}:`);

            if (!alreadyLogged) {
                // Log only *truly* unexpected errors here (e.g., network, apiFn internal throws)
                log.error(
                    `Unexpected error during ${toolName} execution: ${errorMessage}`,
                    error instanceof Error ? { stack: error.stack } : undefined,
                );
            }

            // Always re-throw the error to signal failure to the caller (FastMCP)
            // Throw the original error object if it's an Error instance, otherwise wrap it.
            if (error instanceof Error) {
                throw error;
            } else {
                // Wrap non-Error types before throwing
                throw new Error(
                    `Execution failed for ${toolName}: ${errorMessage}`,
                );
            }
        }
    };
}
