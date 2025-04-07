import type { EsaToolImplementation } from "./types.ts";
// import type { EsaToolLogic, EsaToolSchema } from "./config.ts"; // Removed obsolete import

// Import implementations from each tool file
import * as createPostImpl from "./posts/create.ts";
import * as deletePostImpl from "./posts/delete.ts";
import * as getPostDetailImpl from "./posts/get_detail.ts";
import * as getPostsImpl from "./posts/get_list.ts";
import * as updatePostImpl from "./posts/update.ts";
import * as getUserInfoImpl from "./user/get_info.ts";
// Import other implementations here...
// import { ... } from "./posts/delete.ts";
// import { ... } from "./posts/get_detail.ts";
// ... and so on for all tools

// Remove the old interface definition
// export interface ToolImplementation {
//     config: { readonly name: string; readonly description: string };
//     schema: EsaToolSchema;
//     logic: EsaToolLogic<any, any, any>;
// }

// Map implementation identifiers to their actual implementations
export const implementations: Record<string, EsaToolImplementation> = {
    "posts/create": createPostImpl,
    "posts/delete": deletePostImpl,
    "posts/get_detail": getPostDetailImpl,
    "posts/get_list": getPostsImpl,
    "posts/update": updatePostImpl,
    "user/get_info": getUserInfoImpl,
    // Add other implementations here
    // "posts/delete": { ... },
    // "user/get_info": { ... },
};

// Comment out the validation loop for now
// for (const key in implementations) {
//     if (
//         !implementations[key].config || !implementations[key].schema ||
//         !implementations[key].logic
//     ) {
//         console.error(`Implementation missing parts for key: ${key}`);
//     }
// }
