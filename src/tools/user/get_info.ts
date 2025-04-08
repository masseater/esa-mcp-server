import { z } from "zod";
import { getUserInfo } from "../../esa_client/user.ts";
import type { EsaUser } from "../../esa_client/types.ts";
import type {
    ApiFunction,
    EsaToolConfig,
    EsaToolLogic,
    EsaToolSchema,
} from "../types.ts";

export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_user_info",
    description: "Get current esa.io user information",
} as const;

export const schema: EsaToolSchema = z.object({});

type ValidatedParams = z.infer<typeof schema>;
type ClientFunctionParams = undefined;

export const logic: EsaToolLogic<
    typeof schema,
    EsaUser,
    ClientFunctionParams
> = {
    apiFn: getUserInfo as unknown as ApiFunction<ClientFunctionParams, EsaUser>,

    getClientParams: (
        _validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        return undefined;
    },
};
