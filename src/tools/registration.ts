import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { getUserInfo } from "../esa_client/user.ts";
import { getPosts } from "../esa_client/posts.ts";
import type { GetPostsOptions } from "../esa_client/types.ts";
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

    // 他のツールはここに追加していく...
}
