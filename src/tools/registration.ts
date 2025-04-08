import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { getUserInfo } from "../esa_client/user.ts";
import {
    createPost,
    getPostDetail,
    getPosts,
    updatePost,
} from "../esa_client/posts.ts";
import type {
    CreatePostBody,
    GetPostsOptions,
    UpdatePostBody,
} from "../esa_client/types.ts";
// import { err, ok } from "../esa_client/types.ts"; // 使わない
// import type { EsaUser } from "../esa_client/types.ts"; // 使わない

export function registerEsaTools(server: FastMCP) {
    // user.get_info ツール
    server.addTool({
        name: "user.get_info",
        description: "Get current esa.io user information",
        parameters: z.object({}), // 引数なし
        execute: async (_args, { log }) => { // log を受け取る
            log.info("Executing user.get_info");
            const result = await getUserInfo();

            if (result.ok) {
                log.info("getUserInfo succeeded");
                return JSON.stringify(result.value, null, 2);
            } else {
                log.error(`getUserInfo failed: ${result.error.message}`);
                throw result.error;
            }
        },
    });

    // posts.get_list ツール
    const getPostsParamsSchema = z.object({
        q: z.string().optional().describe("Search query"),
        page: z.number().int().positive().optional().describe("Page number"),
        per_page: z.number().int().positive().max(100).optional().describe(
            "Number of posts per page (max 100)",
        ),
    }).strict(); // strict() を追加して、定義外のパラメータをエラーにする

    server.addTool({
        name: "posts.get_list",
        description: "Get a list of posts from esa.io",
        parameters: getPostsParamsSchema,
        execute: async (args, { log }) => {
            log.info(
                `Executing posts.get_list with args: ${JSON.stringify(args)}`,
            );
            // Zod スキーマで検証済みの args をそのまま GetPostsOptions として渡せるはず
            const options: GetPostsOptions = args;
            const result = await getPosts(options);

            if (result.ok) {
                log.info("getPosts succeeded");
                // TODO: 結果が多い場合、全部返すのは適切か検討
                return JSON.stringify(result.value, null, 2);
            } else {
                log.error(`getPosts failed: ${result.error.message}`);
                throw result.error;
            }
        },
    });

    // posts.get_detail ツール
    const getPostDetailParamsSchema = z.object({
        post_number: z.number().int().positive().describe(
            "The number of the post to retrieve",
        ),
    }).strict();

    server.addTool({
        name: "posts.get_detail",
        description: "Get details of a specific post from esa.io",
        parameters: getPostDetailParamsSchema,
        execute: async (args, { log }) => {
            log.info(
                `Executing posts.get_detail with post_number: ${args.post_number}`,
            );
            const result = await getPostDetail(args.post_number);

            if (result.ok) {
                log.info("getPostDetail succeeded");
                return JSON.stringify(result.value, null, 2);
            } else {
                log.error(`getPostDetail failed: ${result.error.message}`);
                // 404 Not Found の場合は、エラーメッセージだけ返す方が親切かもしれないのだ？
                // でも 일단은 throw しておくのだ
                throw result.error;
            }
        },
    });

    // posts.create ツール
    const createPostParamsSchema = z.object({
        name: z.string().min(1).describe("Post title"),
        body_md: z.string().describe("Post body in Markdown format"),
        tags: z.array(z.string()).optional().describe(
            "List of tags for the post",
        ),
        category: z.string().optional().describe(
            "Category path (e.g., 'foo/bar')",
        ),
        wip: z.boolean().optional().default(true).describe(
            "Whether the post is Work In Progress (default: true)",
        ),
        message: z.string().optional().describe("Commit message for the post"),
    }).strict();

    server.addTool({
        name: "posts.create",
        description: "Create a new post on esa.io",
        parameters: createPostParamsSchema,
        execute: async (args, { log }) => {
            log.info(
                `Executing posts.create with args: ${JSON.stringify(args)}`,
            );
            // Zod スキーマで検証済みの args を CreatePostBody として渡す
            // name と body_md は必須、他はオプション
            const postData: CreatePostBody = {
                post: {
                    name: args.name,
                    body_md: args.body_md,
                    tags: args.tags,
                    category: args.category,
                    wip: args.wip,
                    message: args.message,
                },
            };
            const result = await createPost(postData);

            if (result.ok) {
                log.info("createPost succeeded");
                return JSON.stringify(result.value, null, 2);
            } else {
                log.error(`createPost failed: ${result.error.message}`);
                throw result.error;
            }
        },
    });

    // posts.update ツール
    const updatePostParamsSchema = z.object({
        post_number: z.number().int().positive().describe(
            "The number of the post to update",
        ),
        name: z.string().min(1).optional().describe("New post title"),
        body_md: z.string().optional().describe(
            "New post body in Markdown format",
        ),
        tags: z.array(z.string()).optional().describe("New list of tags"),
        category: z.string().optional().describe("New category path"),
        wip: z.boolean().optional().describe("New WIP status"),
        message: z.string().optional().describe(
            "Commit message for the update",
        ),
    }).strict();

    server.addTool({
        name: "posts.update",
        description: "Update an existing post on esa.io",
        parameters: updatePostParamsSchema,
        execute: async (args, { log }) => {
            log.info(
                `Executing posts.update with args: ${JSON.stringify(args)}`,
            );
            const { post_number, ...updateData } = args;

            // 更新データが空でないことを確認
            if (Object.keys(updateData).length === 0) {
                const errorMsg =
                    "No update data provided. Please specify at least one field to update.";
                log.warn(errorMsg);
                // ユーザーフレンドリーなエラーを返すのが良いかも？
                // throw new Error(errorMsg);
                return JSON.stringify({ error: errorMsg });
            }

            const postBody: UpdatePostBody = { post: updateData };
            const result = await updatePost(post_number, postBody);

            if (result.ok) {
                log.info("updatePost succeeded");
                return JSON.stringify(result.value, null, 2);
            } else {
                log.error(`updatePost failed: ${result.error.message}`);
                throw result.error;
            }
        },
    });

    // 他のツールはここに追加していく...
}
