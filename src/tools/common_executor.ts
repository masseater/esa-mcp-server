import type { z, ZodSchema } from "zod";
import type { Result } from "../esa_client/types.ts";
import type { Context } from "fastmcp";
import type { ApiFunction } from "./types.ts";
import type { UpdatePostBody } from "../esa_client/types.ts";

type GetClientParamsFn<Schema extends ZodSchema<unknown>, ClientParams> = (
    validatedArgs: z.infer<Schema>,
) => ClientParams | undefined;

type FormatSuccessOutputFn<Schema extends z.ZodSchema<unknown>, ClientResult> =
    (
        resultValue: ClientResult,
    ) => string;

interface CreateExecutorOptions<
    Schema extends z.ZodTypeAny,
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

type EsaToolContext = Context<undefined>;

type ExecuteFunction<Schema extends z.ZodTypeAny> = (
    validatedArgs: z.infer<Schema>,
    context: EsaToolContext,
) => Promise<string>;

export function createEsaToolExecutor<
    Schema extends z.ZodTypeAny,
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
            throw new Error(
                `Parameter preparation failed for ${toolName}: ${errorMessage}`,
            );
        }

        try {
            let result: Result<ClientResult, Error>;
            if (toolName === "mcp_esa_server_update_post") {
                const updateParams = clientParams as {
                    postNumber: number;
                    body: UpdatePostBody;
                };
                if (!updateParams) {
                    throw new Error(
                        "Internal error: Client params undefined for updatePost despite preparation.",
                    );
                }
                const specificApiFn = apiFn as unknown as (
                    postNumber: number,
                    body: UpdatePostBody,
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
                return output;
            } else {
                log.error(
                    `[${toolName}] API Error: ${result.error.message}`,
                );
                throw new Error(
                    `API call failed for ${toolName}: ${result.error.message}`,
                );
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);

            const alreadyLogged = errorMessage.startsWith(
                `Parameter preparation failed for ${toolName}:`,
            ) ||
                errorMessage.startsWith(`API call failed for ${toolName}:`);

            if (!alreadyLogged) {
                log.error(
                    `Unexpected error during ${toolName} execution: ${errorMessage}`,
                    error instanceof Error ? { stack: error.stack } : undefined,
                );
            }

            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(
                    `Execution failed for ${toolName}: ${errorMessage}`,
                );
            }
        }
    };
}
