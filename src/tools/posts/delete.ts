import { z } from "zod";
// import { Result } from "../../esa_client/types.ts";
import { deletePost } from "../../esa_client/posts.ts";
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts";

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_delete_post",
    description: "Delete a post from esa.io",
} as const;

// Zod Schema for Input Validation
export const schema: EsaToolSchema = z.object({
    post_number: z.number().int().positive(
        "Post number must be a positive integer",
    ),
});

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = number; // deletePost expects a number

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    true, // deletePost returns Result<true, Error>
    ClientFunctionParams
> = {
    // Assign the imported API function directly
    apiFn: deletePost,

    // clientFunction: async (
    //     params: ClientFunctionParams,
    // ): Promise<Result<true, Error>> => {
    //     return await deletePost(params);
    // },

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return validatedData.post_number;
    },

    formatSuccessOutput: (_result: true): string => {
        // Note: We don't have the post number here directly in the _result (which is just true).
        // If we wanted the post number in the message, getClientParams would need to somehow pass it.
        // For now, a generic success message is fine.
        return `Successfully initiated post deletion.`;
        // Alternative if we modify things to pass the number:
        // return `Successfully initiated deletion for post #${validatedData.post_number}.`;
    },
};
