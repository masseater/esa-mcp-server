import { esaClientConfig } from "./config.ts";
import type {
    CreatePostBody,
    EsaPost,
    GetPostsOptions,
    GetPostsResponse,
    Result,
    UpdatePostBody,
} from "./types.ts";
import { err, ok } from "./types.ts";

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

export async function createPost(
    body: CreatePostBody,
): Promise<Result<EsaPost, Error>> {
    const url = `${esaClientConfig.baseUrl}/posts`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                ...esaClientConfig.headers,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
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

        const createdPost: EsaPost = await response.json();
        return ok(createdPost);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}

export async function updatePost(
    postNumber: number,
    body: UpdatePostBody,
): Promise<Result<EsaPost, Error>> {
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
            headers: {
                ...esaClientConfig.headers,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
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

        const updatedPost: EsaPost = await response.json();
        return ok(updatedPost);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}
