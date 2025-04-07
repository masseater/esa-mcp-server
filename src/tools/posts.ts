import type { FastMCP } from "fastmcp";
import { z } from "zod";
// Import functions directly from the specific client file
import {
    createPost,
    deletePost,
    getPostDetail,
    getPosts,
    updatePost,
} from "../esa_client/posts.ts";
// Import types directly from the specific types file
import type {
    CreatePostBody,
    GetPostsOptions,
    UpdatePostBody,
} from "../esa_client/types.ts";

// Schema for the 'post' object within the create_post parameters
const createPostObjectSchema = z.object({
    name: z.string().min(1, { message: "Post name cannot be empty" }), // Title is required
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional(), // Defaults to true on esa.io side if omitted
    message: z.string().optional(),
    // user: z.string().optional(), // Add if needed
});

// Schema for the create_post tool parameters
const createPostParams = z.object({
    post: createPostObjectSchema,
});

// Schema for the 'post' object within the update_post parameters
const updatePostObjectSchema = z.object({
    name: z.string().min(1).optional(),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional(),
    message: z.string().optional(),
});

// Schema for the update_post tool parameters
const updatePostParams = z.object({
    postNumber: z.number().int().positive({
        message: "Post number must be a positive integer",
    }),
    post: updatePostObjectSchema,
});

// Schema for the delete_post tool parameters
const deletePostParams = z.object({
    postNumber: z.number().int().positive({
        message: "Post number must be a positive integer",
    }),
});

// Schema for the get_posts tool parameters
const getPostsParams = z.object({
    q: z.string().optional(),
    page: z.number().int().positive().optional(),
    per_page: z.number().int().min(1).max(100).optional(),
    // Add other options like include, sort, order if needed
});

// Schema for the get_post_detail tool parameters
const getPostDetailParams = z.object({
    postNumber: z.number().int().positive({
        message: "Post number must be a positive integer",
    }),
});

export function registerPostTools(server: FastMCP): void {
    // create_post Tool
    server.addTool({
        name: "create_post",
        description: "Create a new post on esa.io.",
        parameters: createPostParams,
        async execute(
            args: z.infer<typeof createPostParams>,
            { log },
        ): Promise<string> {
            log.info(
                `Executing create_post tool with name: ${args.post.name}...`,
            );
            const body: CreatePostBody = { post: args.post };
            try {
                const result = await createPost(body);
                if (result.ok) {
                    log.info(
                        `create_post tool execution successful. Post number: ${result.value.number}`,
                    );
                    return JSON.stringify(result.value, null, 2);
                } else {
                    const errorMessage =
                        `create_post failed: ${result.error.message}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }
            } catch (toolError) {
                const errorMessage = toolError instanceof Error
                    ? toolError.message
                    : String(toolError);
                log.error(
                    `Error during create_post execution: ${errorMessage}`,
                );
                throw toolError instanceof Error
                    ? toolError
                    : new Error(errorMessage);
            }
        },
    });

    // update_post Tool
    server.addTool({
        name: "update_post",
        description: "Update an existing post on esa.io.",
        parameters: updatePostParams,
        async execute(
            args: z.infer<typeof updatePostParams>,
            { log },
        ): Promise<string> {
            log.info(
                `Executing update_post tool for post number: ${args.postNumber}...`,
            );
            const body: UpdatePostBody = { post: args.post };
            if (Object.keys(args.post).length === 0) {
                const errorMessage =
                    "update_post failed: No fields provided for update.";
                log.error(errorMessage);
                throw new Error(errorMessage);
            }
            try {
                const result = await updatePost(args.postNumber, body);
                if (result.ok) {
                    log.info(
                        `update_post tool execution successful for post number: ${args.postNumber}`,
                    );
                    return JSON.stringify(result.value, null, 2);
                } else {
                    const errorMessage =
                        `update_post failed for post ${args.postNumber}: ${result.error.message}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }
            } catch (toolError) {
                const errorMessage = toolError instanceof Error
                    ? toolError.message
                    : String(toolError);
                log.error(
                    `Error during update_post execution for post ${args.postNumber}: ${errorMessage}`,
                );
                throw toolError instanceof Error
                    ? toolError
                    : new Error(errorMessage);
            }
        },
    });

    // delete_post Tool
    server.addTool({
        name: "delete_post",
        description: "Delete a specific post on esa.io.",
        parameters: deletePostParams,
        async execute(
            args: z.infer<typeof deletePostParams>,
            { log },
        ): Promise<string> {
            log.info(
                `Executing delete_post tool for post number: ${args.postNumber}...`,
            );
            try {
                const result = await deletePost(args.postNumber);
                if (result.ok) {
                    const successMessage =
                        `Successfully deleted post number: ${args.postNumber}`;
                    log.info(successMessage);
                    return successMessage;
                } else {
                    const errorMessage =
                        `delete_post failed for post ${args.postNumber}: ${result.error.message}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }
            } catch (toolError) {
                const errorMessage = toolError instanceof Error
                    ? toolError.message
                    : String(toolError);
                log.error(
                    `Error during delete_post execution for post ${args.postNumber}: ${errorMessage}`,
                );
                throw toolError instanceof Error
                    ? toolError
                    : new Error(errorMessage);
            }
        },
    });

    // get_posts Tool
    server.addTool({
        name: "get_posts",
        description: "Get a list of posts from esa.io, with optional filters.",
        parameters: getPostsParams,
        async execute(
            args: z.infer<typeof getPostsParams>,
            { log },
        ): Promise<string> {
            log.info("Executing get_posts tool with options:", args);
            const options: GetPostsOptions = args;
            try {
                const result = await getPosts(options);
                if (result.ok) {
                    log.info(
                        `get_posts tool execution successful. Found ${result.value.total_count} posts.`,
                    );
                    return JSON.stringify(result.value, null, 2);
                } else {
                    const errorMessage =
                        `get_posts failed: ${result.error.message}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }
            } catch (toolError) {
                const errorMessage = toolError instanceof Error
                    ? toolError.message
                    : String(toolError);
                log.error(`Error during get_posts execution: ${errorMessage}`);
                throw toolError instanceof Error
                    ? toolError
                    : new Error(errorMessage);
            }
        },
    });

    // get_post_detail Tool
    server.addTool({
        name: "get_post_detail",
        description: "Get the details of a specific post from esa.io.",
        parameters: getPostDetailParams,
        async execute(
            args: z.infer<typeof getPostDetailParams>,
            { log },
        ): Promise<string> {
            log.info(
                `Executing get_post_detail tool for post number: ${args.postNumber}...`,
            );
            try {
                const result = await getPostDetail(args.postNumber);
                if (result.ok) {
                    log.info(
                        `get_post_detail tool execution successful for post number: ${args.postNumber}`,
                    );
                    return JSON.stringify(result.value, null, 2);
                } else {
                    const errorMessage =
                        `get_post_detail failed for post ${args.postNumber}: ${result.error.message}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }
            } catch (toolError) {
                const errorMessage = toolError instanceof Error
                    ? toolError.message
                    : String(toolError);
                log.error(
                    `Error during get_post_detail execution for post ${args.postNumber}: ${errorMessage}`,
                );
                throw toolError instanceof Error
                    ? toolError
                    : new Error(errorMessage);
            }
        },
    });
}
