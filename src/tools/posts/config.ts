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
} as const;

export type PostToolName = keyof typeof postsToolConfigs;
