// Defines the configuration (name, description) for the user-related tool.

export const userToolConfigs = {
    get_info: {
        name: "esa_get_user_info",
        description: "Get authenticated user information from esa.io.",
    },
    // Add other user-related tools here if needed in the future
} as const;

export type UserToolName = keyof typeof userToolConfigs;
