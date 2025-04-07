import { z } from "zod";
import { getPostDetail } from "../../esa_client/posts.ts";
import type { EsaPost } from "../../esa_client/types.ts";
import type { EsaToolLogic } from "../types.ts";
import type { EsaToolConfig, EsaToolSchema } from "../types.ts";

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_post_detail",
    description: "Get detailed information about a specific post",
} as const;

// Zod Schema for Input Validation
export const schema: EsaToolSchema = z.object({
    post_number: z.number().int().positive(
        "Post number must be a positive integer",
    ),
});

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = number; // getPostDetail expects a number

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    EsaPost, // getPostDetail returns Result<EsaPost, Error>
    ClientFunctionParams
> = {
    // Assign the imported API function directly
    apiFn: getPostDetail,

    // clientFunction: async (
    //     params: ClientFunctionParams,
    // ): Promise<Result<EsaPost, Error>> => {
    //     return await getPostDetail(params);
    // },

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return validatedData.post_number;
    },
    // Default JSON stringify is fine for the result object
    // formatSuccessOutput is not needed
};
