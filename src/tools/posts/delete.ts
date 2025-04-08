import { z } from "zod";
import { deletePost } from "../../esa_client/posts.ts";
import type { EsaToolConfig, EsaToolLogic, EsaToolSchema } from "../types.ts";

export const config: EsaToolConfig = {
    name: "mcp_esa_server_delete_post",
    description: "Delete a post from esa.io",
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
    true,
    ClientFunctionParams
> = {
    apiFn: deletePost,

    getClientParams: (
        validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return validatedData.post_number;
    },

    formatSuccessOutput: (): string => {
        return `Successfully initiated post deletion.`;
    },
};
