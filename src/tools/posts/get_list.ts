import { z } from "zod";
import type {
    GetPostsOptions,
    GetPostsResponse,
} from "../../esa_client/types.ts";
import { getPosts } from "../../esa_client/posts.ts";
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts";

export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_posts",
    description: "Get a list of posts from esa.io",
} as const;

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
}).optional();

type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = GetPostsOptions;

export const logic: EsaToolLogic<
    typeof schema,
    GetPostsResponse,
    ClientFunctionParams
> = {
    apiFn: getPosts,

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return validatedData ?? {};
    },
};
