// src/esa_client/types.ts (復活＆整理版)
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T, E>(value: T): Result<T, E> {
    return { ok: true, value };
}

export function err<T, E>(error: E): Result<T, E> {
    return { ok: false, error };
}

export interface EsaUser {
    id: number;
    name: string;
    screen_name: string;
    created_at: string;
    updated_at: string;
    icon: string;
    email: string;
}

export interface EsaPost {
    number: number;
    name: string;
    full_name: string;
    wip: boolean;
    body_md: string;
    body_html: string;
    created_at: string;
    updated_at: string;
    message: string;
    url: string;
    tags: string[];
    category: string | null;
    revision_number: number;
    created_by: {
        myself: boolean;
        name: string;
        screen_name: string;
        icon: string;
    };
    updated_by: {
        myself: boolean;
        name: string;
        screen_name: string;
        icon: string;
    };
}

export interface GetPostsResponse {
    posts: EsaPost[];
    prev_page: number | null;
    next_page: number | null;
    total_count: number;
    page: number;
    per_page: number;
    max_per_page: number;
}

export interface GetPostsOptions {
    q?: string;
    page?: number;
    per_page?: number;
}

export interface CreatePostBody {
    post: {
        name: string;
        body_md?: string;
        tags?: string[];
        category?: string;
        wip?: boolean;
        message?: string;
        user?: string; // 作成ユーザーのscreen_name
    };
}

export interface UpdatePostBody {
    post: {
        name?: string;
        body_md?: string;
        tags?: string[];
        category?: string;
        wip?: boolean;
        message?: string;
        // user?: string; 更新時は指定できないはず
    };
}
