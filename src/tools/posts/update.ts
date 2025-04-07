import { z } from "zod";
import type { EsaPost, UpdatePostBody } from "../../esa_client/types.ts";
import { Result } from "../../esa_client/types.ts";
import { updatePost } from "../../esa_client/posts.ts";
import type {
    ApiFunction,
    EsaToolConfig,
    EsaToolLogic,
    EsaToolSchema,
} from "../types.ts";

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_update_post",
    description: "Update an existing post on esa.io",
} as const;

// Zod Schema for Input Validation
const updatePostObjectSchema = z.object({
    name: z.string().min(1).optional(),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional(),
    message: z.string().optional(),
    // user cannot be updated via API
});

export const schema: EsaToolSchema = z.object({
    post_number: z.number().int().positive(
        "Post number must be a positive integer",
    ),
    post: updatePostObjectSchema,
}).refine((data) => Object.keys(data.post).length > 0, {
    message: "At least one field in 'post' must be provided for update",
    path: ["post"], // Specify the path of the error
});

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;
// Define the parameters structure expected by the wrapped client function
interface WrappedClientParams {
    postNumber: number;
    body: UpdatePostBody;
}

// Define the specific type for the updatePost API function
type UpdateApiFn = (
    postNumber: number,
    body: UpdatePostBody,
) => Promise<Result<EsaPost, Error>>;

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    EsaPost, // updatePost returns Result<EsaPost, Error>
    WrappedClientParams // The wrapped function expects this structure
> = {
    // Assign the imported API function, casting it to the expected generic type
    // The executor will handle the parameter mapping based on getClientParams
    apiFn: updatePost as unknown as ApiFunction<WrappedClientParams, EsaPost>,

    getClientParams: (
        validatedData: ValidatedParams,
    ): WrappedClientParams | undefined => {
        // Transform validated data into the structure needed by the wrapped clientFunction
        return {
            postNumber: validatedData.post_number,
            body: { post: validatedData.post }, // Nest the post data
        };
    },

    formatSuccessOutput: (result: EsaPost): string => {
        return `Successfully updated post #${result.number}: ${result.full_name}`;
    },
};
