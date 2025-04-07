// Defines the configuration (name, description) for each post-related tool.
// The keys should ideally match the implementation file names (without .ts)
// or some other consistent identifier used in the registration logic.

export const postsToolConfigs = {
    create: {
        name: "create_post",
        description: "Create a new post on esa.io.",
    },
    get_list: {
        name: "get_posts",
        description: "Get a list of posts from esa.io, with optional filters.",
    },
    get_detail: {
        name: "get_post_detail",
        description: "Get the details of a specific post from esa.io.",
    },
    update: {
        name: "update_post",
        description: "Update an existing post on esa.io.",
    },
    delete: {
        name: "delete_post",
        description: "Delete a specific post on esa.io.",
    },
} as const; // Use 'as const' for stricter typing of keys and values

// Optional: Define a type for the keys if needed elsewhere
export type PostToolName = keyof typeof postsToolConfigs;
