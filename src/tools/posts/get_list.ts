import { z } from "zod";
import type {
    GetPostsOptions,
    GetPostsResponse,
} from "../../esa_client/types.ts";
import { Result } from "../../esa_client/types.ts";
import { getPosts } from "../../esa_client/posts.ts";
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts";

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_posts",
    description: "Get a list of posts from esa.io",
} as const;

// Zod Schema for Input Validation - Optional parameters
export const schema: EsaToolSchema = z.object({
    q: z.string().optional().describe(
        "Search query (e.g., 'in:category path/to/category')",
    ),
    page: z.number().int().positive().optional().describe(
        "Page number for pagination",
    ),
    per_page: z.number().int().min(1).max(100).optional().describe(
        "Number of items per page (1-100)",
    ),
}).optional(); // Allow calling the tool with no parameters

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = GetPostsOptions; // getPosts expects GetPostsOptions

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    GetPostsResponse, // getPosts returns Result<GetPostsResponse, Error>
    ClientFunctionParams
> = {
    // Assign the imported API function directly
    apiFn: getPosts,

    // clientFunction: async (
    //     params: ClientFunctionParams = {}, // Default to empty options
    // ): Promise<Result<GetPostsResponse, Error>> => {
    //     return await getPosts(params);
    // },

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        // validatedData directly matches GetPostsOptions structure, or is undefined
        return validatedData ?? {}; // Return empty object if no params provided
    },
    // Default JSON stringify is fine for the result object
};
