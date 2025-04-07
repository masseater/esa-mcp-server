import { z } from "zod";
// import type { EsaClient, Post } from "../../esa_client/client.ts"; // Removed, client class doesn't exist
import type { CreatePostBody, EsaPost } from "../../esa_client/types.ts"; // Import correct types
import { ok, Result } from "../../esa_client/types.ts"; // Import Result types/helpers
// import { createPostBodySchema } from "../../esa_client/schema.ts"; // Schema is likely in posts.ts
import { createPost } from "../../esa_client/posts.ts"; // Import the API function
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts"; // Import our Tool types

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_create_post",
    description: "Create a new post on esa.io",
} as const;

// Zod Schema for Input Validation - Define based on CreatePostBody interface
const createPostObjectSchema = z.object({
    name: z.string().min(1, { message: "Post name cannot be empty" }),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional().default(true), // Default to WIP
    message: z.string().optional(),
    user: z.string().optional(), // Added based on CreatePostBody interface
});

export const schema: EsaToolSchema = z.object({
    post: createPostObjectSchema,
});

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    EsaPost, // Result type from API (was Post)
    CreatePostBody // Params type for clientFunction (matches API function)
> = {
    // Assign the imported API function directly
    apiFn: createPost,

    // clientFunction: async (
    //     params: CreatePostBody,
    // ): Promise<Result<EsaPost, Error>> => {
    //     return await createPost(params);
    // },

    getClientParams: (
        validatedData: ValidatedParams,
    ): CreatePostBody | undefined => {
        // Transform validated data into the CreatePostBody format
        return { post: validatedData.post };
    },

    formatSuccessOutput: (result: EsaPost): string => {
        return `Successfully created post #${result.number}: ${result.full_name}`;
    },
};
