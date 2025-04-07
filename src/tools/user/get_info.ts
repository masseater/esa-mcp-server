import { z } from "zod";
import { getUserInfo } from "../../esa_client/user.ts";
import type { EsaUser } from "../../esa_client/types.ts";
import type {
    ApiFunction, // Import ApiFunction
    EsaToolConfig,
    EsaToolLogic,
    EsaToolSchema,
} from "../types.ts";

// Tool Configuration
export const config: EsaToolConfig = {
    name: "mcp_esa_server_get_user_info",
    description: "Get current esa.io user information",
} as const;

// Zod Schema for Input Validation - No parameters needed
// Use z.object({}) for tools that take no arguments
export const schema: EsaToolSchema = z.object({});

// Infer types from the schema
type ValidatedParams = z.infer<typeof schema>;
// The API function getUserInfo takes no arguments, so params type is undefined
type ClientFunctionParams = undefined;

// Logic Implementation
export const logic: EsaToolLogic<
    typeof schema,
    EsaUser, // getUserInfo returns Result<EsaUser, Error>
    ClientFunctionParams
> = {
    // Assign the imported API function, casting to the expected type
    apiFn: getUserInfo as unknown as ApiFunction<ClientFunctionParams, EsaUser>,

    // clientFunction: async (
    //     _params: ClientFunctionParams,
    // ): Promise<Result<EsaUser, Error>> => {
    //     return await getUserInfo();
    // },

    getClientParams: (
        _validatedData: ValidatedParams,
    ): ClientFunctionParams | undefined => {
        // No parameters needed for the API call
        return undefined;
    },
    // Default JSON stringify is fine for the user object
};
