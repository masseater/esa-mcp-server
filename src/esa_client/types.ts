// --- Result 型定義 ---
/**
 * 処理結果を示す汎用的な型なのだ。
 * 成功時は { ok: true, value: T }、失敗時は { ok: false, error: E } となるのだ。
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * 成功時の Result オブジェクトを作成するヘルパー関数なのだ。
 */
export function ok<T, E>(value: T): Result<T, E> {
    return { ok: true, value };
}

/**
 * 失敗時の Result オブジェクトを作成するヘルパー関数なのだ。
 */
export function err<T, E>(error: E): Result<T, E> {
    return { ok: false, error };
}

// --- ユーザー関連型定義 ---
/**
 * esa.io ユーザー情報の型定義
 * @see https://docs.esa.io/posts/102#GET /v1/user
 */
export interface EsaUser {
    id: number;
    name: string;
    screen_name: string;
    created_at: string; // ISO 8601形式
    updated_at: string; // ISO 8601形式
    icon: string; // URL
    email: string;
}

// --- 記事関連型定義 ---
/**
 * esa.io 記事情報の基本的な型定義
 * @see https://docs.esa.io/posts/102#GET /v1/teams/:team_name/posts
 */
export interface EsaPost {
    number: number;
    name: string; // 記事タイトル
    full_name: string; // カテゴリ含む記事名 (e.g., "日報/2024/04/08/本日の作業")
    wip: boolean; // Work in Progress かどうか
    body_md: string; // Markdown本文
    body_html: string; // HTML本文
    created_at: string;
    updated_at: string;
    message: string; // update時のメッセージ
    url: string; // 記事のURL
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

/**
 * 記事一覧取得APIのレスポンス型
 */
export interface GetPostsResponse {
    posts: EsaPost[];
    prev_page: number | null;
    next_page: number | null;
    total_count: number;
    page: number;
    per_page: number;
    max_per_page: number;
}

/**
 * 記事一覧取得APIのクエリオプション
 */
export interface GetPostsOptions {
    q?: string;
    page?: number;
    per_page?: number;
}

/**
 * 記事作成APIに渡すリクエストボディの型
 * @see https://docs.esa.io/posts/102#POST /v1/teams/:team_name/posts
 */
export interface CreatePostBody {
    post: {
        name: string;
        body_md?: string;
        tags?: string[];
        category?: string;
        wip?: boolean;
        message?: string;
        user?: string;
    };
}

/**
 * 記事作成APIのレスポンス型
 */
export type CreatePostResponse = EsaPost;

/**
 * 記事更新APIに渡すリクエストボディの型
 * @see https://docs.esa.io/posts/102#PATCH /v1/teams/:team_name/posts/:post_number
 */
export interface UpdatePostBody {
    post: {
        name?: string;
        body_md?: string;
        tags?: string[];
        category?: string;
        wip?: boolean;
        message?: string;
    };
}

/**
 * 記事更新APIのレスポンス型
 */
export type UpdatePostResponse = EsaPost;

// --- エラー関連型定義 (必要であれば追加) ---
// 例: export type ApiError = { status: number; message: string; };

export type User = {
    name: string;
    screen_name: string;
    icon: string;
    myself: boolean;
};
