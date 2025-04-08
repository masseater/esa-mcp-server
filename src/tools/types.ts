import { z } from "zod";
import { Result } from "../esa_client/types.ts"; // Import Result from the correct location
// import type { esaClientConfig } from "../esa_client/config.ts"; // Config is used internally by API functions

// Derive the type from the config object itself
// type EsaClientConfig = typeof esaClientConfig; // Not needed for the logic type

/**
 * Type for the actual API function that the logic object will hold.
 * Takes parameters derived from getClientParams and returns a Result.
 */
export type ApiFunction<TParams, TResult> = (
    params: TParams,
) => Promise<Result<TResult, Error>>;

/**
 * The base type for logic objects used in tool registration.
 * Defines the contract for transforming data and formatting results,
 * and holds the reference to the actual API function to call.
 */
export type EsaToolLogic<
    TSchema extends z.ZodTypeAny,
    TResult,
    TParams = unknown,
> = {
    /** The actual API function (e.g., createPost, getPosts) to execute */
    apiFn: ApiFunction<TParams, TResult>;

    /** Function to transform validated schema data to API function parameters */
    getClientParams: (
        validatedData: z.infer<TSchema>,
    ) => TParams | undefined;

    /** Optional function to format the success result string */
    formatSuccessOutput?: (result: TResult) => string;
};

/**
 * Base type for Zod schemas used for tool parameter validation.
 */
export type EsaToolSchema = z.ZodTypeAny;

/**
 * Type definition for the tool configuration object expected from each implementation file.
 */
export interface EsaToolConfig {
    name: string;
    description: string;
}

/**
 * Type definition for a complete tool implementation module.
 */
export interface EsaToolImplementation<
    TSchema extends EsaToolSchema = EsaToolSchema,
    TResult = unknown,
    TParams = unknown,
> {
    schema: TSchema;
    logic: EsaToolLogic<TSchema, TResult, TParams>;
    config: EsaToolConfig;
}
