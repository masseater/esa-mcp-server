import { z } from "zod";
import type { CreatePostBody, EsaPost } from "../../esa_client/types.ts";
import { createPost } from "../../esa_client/posts.ts";
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts";

export const config: EsaToolConfig = {
    name: "mcp_esa_server_create_post",
    description: "Create a new post on esa.io",
} as const;

const createPostObjectSchema = z.object({
    name: z.string().min(1, { message: "Post name cannot be empty" }),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional().default(true),
    message: z.string().optional(),
    user: z.string().optional(),
});

export const schema: EsaToolSchema = z.object({
    post: createPostObjectSchema,
});

type ValidatedParams = z.infer<typeof schema>;

export const logic: EsaToolLogic<
    typeof schema,
    EsaPost,
    CreatePostBody
> = {
    apiFn: createPost,

    getClientParams: (
        validatedData: ValidatedParams,
    ): CreatePostBody | undefined => {
        return { post: validatedData.post };
    },

    formatSuccessOutput: (result: EsaPost): string => {
        return `Successfully created post #${result.number}: ${result.full_name}`;
    },
};
