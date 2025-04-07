import { esaClientConfig } from "./config.ts";
import type {
    CreatePostBody,
    CreatePostResponse,
    EsaPost,
    GetPostsOptions,
    GetPostsResponse,
    Result,
    UpdatePostBody,
    UpdatePostResponse,
} from "./types.ts";
import { err, ok } from "./types.ts";

/**
 * esa.io API から記事一覧を取得する関数なのだ
 */
export async function getPosts(
    options: GetPostsOptions = {},
): Promise<Result<GetPostsResponse, Error>> {
    const params = new URLSearchParams();
    if (options.q) {
        params.set("q", options.q);
    }
    if (options.page) {
        params.set("page", options.page.toString());
    }
    if (options.per_page) {
        params.set("per_page", options.per_page.toString());
    }

    const queryString = params.toString();
    const url = `${esaClientConfig.baseUrl}/posts${
        queryString ? `?${queryString}` : ""
    }`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: esaClientConfig.headers,
        });

        if (!response.ok) {
            const errorBody = await response
                .text()
                .catch(() => "(Failed to read error body)");
            return err(
                new Error(
                    `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
                ),
            );
        }

        const data: GetPostsResponse = await response.json();
        return ok(data);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}

/**
 * esa.io API から特定の記事の詳細を取得する関数なのだ
 */
export async function getPostDetail(
    postNumber: number,
): Promise<Result<EsaPost, Error>> {
    if (postNumber <= 0) {
        return err(new Error("Invalid post number. Must be greater than 0."));
    }

    const url = `${esaClientConfig.baseUrl}/posts/${postNumber}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: esaClientConfig.headers,
        });

        if (!response.ok) {
            const errorBody = await response
                .text()
                .catch(() => "(Failed to read error body)");
            return err(
                new Error(
                    `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
                ),
            );
        }

        const post: EsaPost = await response.json();
        return ok(post);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}

/**
 * esa.io API で指定された記事を削除する関数なのだ
 */
export async function deletePost(
    postNumber: number,
): Promise<Result<true, Error>> {
    if (postNumber <= 0) {
        return err(new Error("Invalid post number. Must be greater than 0."));
    }

    const url = `${esaClientConfig.baseUrl}/posts/${postNumber}`;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: esaClientConfig.headers.Authorization,
            },
        });

        if (response.status !== 204) {
            const errorBody = await response.text().catch(() =>
                "(Failed to read error body)"
            );
            return err(
                new Error(
                    `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
                ),
            );
        }

        return ok(true);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}

/**
 * esa.io API で新しい記事を作成する関数なのだ
 */
export async function createPost(
    body: CreatePostBody,
): Promise<Result<CreatePostResponse, Error>> {
    const url = `${esaClientConfig.baseUrl}/posts`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: esaClientConfig.headers,
            body: JSON.stringify(body),
        });

        if (response.status !== 201) {
            const errorBody = await response
                .text()
                .catch(() => "(Failed to read error body)");
            return err(
                new Error(
                    `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
                ),
            );
        }

        const createdPost: CreatePostResponse = await response.json();
        return ok(createdPost);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}

/**
 * esa.io API で既存の記事を更新する関数なのだ
 */
export async function updatePost(
    postNumber: number,
    body: UpdatePostBody,
): Promise<Result<UpdatePostResponse, Error>> {
    if (postNumber <= 0) {
        return err(new Error("Invalid post number. Must be greater than 0."));
    }

    if (Object.keys(body.post).length === 0) {
        return err(new Error("No update fields provided."));
    }

    const url = `${esaClientConfig.baseUrl}/posts/${postNumber}`;

    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: esaClientConfig.headers,
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            const errorBody = await response
                .text()
                .catch(() => "(Failed to read error body)");
            return err(
                new Error(
                    `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
                ),
            );
        }

        const updatedPost: UpdatePostResponse = await response.json();
        return ok(updatedPost);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}
