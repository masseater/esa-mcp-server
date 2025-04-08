export const userToolConfigs = {
    get_info: {
        name: "esa_get_user_info",
        description: "Get authenticated user information from esa.io.",
    },
} as const;

export type UserToolName = keyof typeof userToolConfigs;
