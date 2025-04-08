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

export const config: EsaToolConfig = {
    name: "mcp_esa_server_update_post",
    description: "Update an existing post on esa.io",
} as const;

const updatePostObjectSchema = z.object({
    name: z.string().min(1).optional(),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional(),
    message: z.string().optional(),
});

export const schema: EsaToolSchema = z.object({
    post_number: z.number().int().positive(
        "Post number must be a positive integer",
    ),
    post: updatePostObjectSchema,
}).refine((data) => Object.keys(data.post).length > 0, {
    message: "At least one field in 'post' must be provided for update",
    path: ["post"],
});

type ValidatedParams = z.infer<typeof schema>;

interface WrappedClientParams {
    postNumber: number;
    body: UpdatePostBody;
}

type UpdateApiFn = (
    postNumber: number,
    body: UpdatePostBody,
) => Promise<Result<EsaPost, Error>>;

export const logic: EsaToolLogic<
    typeof schema,
    EsaPost,
    WrappedClientParams
> = {
    apiFn: updatePost as unknown as ApiFunction<WrappedClientParams, EsaPost>,

    getClientParams: (
        validatedData: ValidatedParams,
    ): WrappedClientParams | undefined => {
        return {
            postNumber: validatedData.post_number,
            body: { post: validatedData.post },
        };
    },

    formatSuccessOutput: (result: EsaPost): string => {
        return `Successfully updated post #${result.number}: ${result.full_name}`;
    },
};
