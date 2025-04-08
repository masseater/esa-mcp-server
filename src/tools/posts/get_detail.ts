import { z } from "zod";
import { getPostDetail } from "../../esa_client/posts.ts";
import type { EsaPost } from "../../esa_client/types.ts";
import type { EsaToolLogic } from "../types.ts";
import type { EsaToolConfig, EsaToolSchema } from "../types.ts";

export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_post_detail",
    description: "Get detailed information about a specific post",
} as const;

export const schema: EsaToolSchema = z.object({
    post_number: z.number().int().positive(
        "Post number must be a positive integer",
    ),
});

type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = number;

export const logic: EsaToolLogic<
    typeof schema,
    EsaPost,
    ClientFunctionParams
> = {
    apiFn: getPostDetail,

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return validatedData.post_number;
    },
};
