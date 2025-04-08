import * as createPostImpl from "./posts/create.ts";
import * as deletePostImpl from "./posts/delete.ts";
import * as getPostDetailImpl from "./posts/get_detail.ts";
import * as getPostsImpl from "./posts/get_list.ts";
import * as updatePostImpl from "./posts/update.ts";
import * as getUserInfoImpl from "./user/get_info.ts";

export const implementations = {
    "posts/create": createPostImpl,
    "posts/delete": deletePostImpl,
    "posts/get_detail": getPostDetailImpl,
    "posts/get_list": getPostsImpl,
    "posts/update": updatePostImpl,
    "user/get_info": getUserInfoImpl,
} as const;
