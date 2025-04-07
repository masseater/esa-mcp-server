import { load } from "dotenv";

// .env ファイルから環境変数を読み込む
// allowEmptyValues: true にしないと、値がない場合にエラーになることがあるのだ
const env = await load({ export: true, allowEmptyValues: true });

const ESA_TOKEN = Deno.env.get("ESA_TOKEN");
const ESA_TEAM_NAME = Deno.env.get("ESA_TEAM_NAME");

// トークンとチーム名が設定されているか確認するのだ
if (!ESA_TOKEN) {
  console.error("エラー: 環境変数 ESA_TOKEN が設定されていません。");
  Deno.exit(1); // エラーで終了するのだ
}
if (!ESA_TEAM_NAME) {
  console.error("エラー: 環境変数 ESA_TEAM_NAME が設定されていません。");
  Deno.exit(1); // エラーで終了するのだ
}

// ベースURLとヘッダーを作成するのだ
const BASE_URL = `https://api.esa.io/v1/teams/${ESA_TEAM_NAME}`;
const AUTH_HEADERS = {
  Authorization: `Bearer ${ESA_TOKEN}`,
  "Content-Type": "application/json",
};

// APIクライアントの設定をエクスポートするのだ
export const esaClientConfig = {
  baseUrl: BASE_URL,
  headers: AUTH_HEADERS,
};

// --- ここから Result 型の定義と getUserInfo の変更 ---

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

/**
 * esa.io ユーザー情報の型定義 (必要に応じて拡張するのだ)
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

/**
 * esa.io API から認証されたユーザー情報を取得する関数なのだ
 * 成功/失敗を Result 型で返すように変更したのだ。
 */
export async function getUserInfo(): Promise<Result<EsaUser, Error>> {
  const url = `https://api.esa.io/v1/user`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: esaClientConfig.headers,
    });

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => "(Failed to read error body)"); // エラー内容取得失敗も考慮
      console.error(
        `[API Error] Failed to fetch user info: ${response.status} ${response.statusText}`,
      );
      // Error オブジェクトで失敗を示すのだ
      return err(
        new Error(
          `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
        ),
      );
    }

    const user: EsaUser = await response.json();
    return ok(user); // ok で成功を示すのだ
  } catch (error) {
    console.error("[Network Error] Failed to fetch user info:", error);
    // ネットワークエラーなども Error オブジェクトで返すのだ
    return err(
      error instanceof Error ? error : new Error("Unknown network error"),
    );
  }
}

// --- ここまで Result 型の定義と getUserInfo の変更 ---

// --- ここから追加 ---

/**
 * esa.io 記事情報の基本的な型定義 (必要に応じて拡張するのだ)
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
    // 作成者情報 (簡易)
    myself: boolean;
    name: string;
    screen_name: string;
    icon: string;
  };
  updated_by: {
    // 更新者情報 (簡易)
    myself: boolean;
    name: string;
    screen_name: string;
    icon: string;
  };
  // 他にも overlap や comments_count など色々あるのだ
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
  q?: string; // 検索クエリ
  page?: number; // ページ番号
  per_page?: number; // 1ページあたりの記事数 (1-100)
  // 他にも include や sort, order などがあるのだ
}

/**
 * esa.io API から記事一覧を取得する関数なのだ
 */
export async function getPosts(
  options: GetPostsOptions = {},
): Promise<Result<GetPostsResponse, Error>> {
  // URLSearchParams を使ってクエリパラメータを組み立てるのだ
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
      console.error(
        `[API Error] Failed to fetch posts: ${response.status} ${response.statusText}`,
        `URL: ${url}`,
      );
      return err(
        new Error(
          `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
        ),
      );
    }

    const data: GetPostsResponse = await response.json();
    return ok(data);
  } catch (error) {
    console.error("[Network Error] Failed to fetch posts:", error);
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
    // 不正な記事番号の場合は、APIを叩く前にエラーにするのだ
    return err(new Error("Invalid post number. Must be greater than 0."));
  }

  const url = `${esaClientConfig.baseUrl}/posts/${postNumber}`; // 記事番号をパスに追加

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: esaClientConfig.headers,
    });

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => "(Failed to read error body)");
      console.error(
        `[API Error] Failed to fetch post detail (number: ${postNumber}): ${response.status} ${response.statusText}`,
        `URL: ${url}`,
      );
      return err(
        new Error(
          `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
        ),
      );
    }

    const post: EsaPost = await response.json();
    // 記事番号が一致しているか念のため確認するのだ
    if (post.number !== postNumber) {
      console.warn(
        `[Data Warning] Requested post number ${postNumber} but received ${post.number}.`,
      );
    }
    return ok(post);
  } catch (error) {
    console.error(
      `[Network Error] Failed to fetch post detail (number: ${postNumber}):`,
      error,
    );
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
): Promise<Result<true, Error>> { // 成功時はボディがないので Result<true, Error> とするのだ
  if (postNumber <= 0) {
    return err(new Error("Invalid post number. Must be greater than 0."));
  }

  const url = `${esaClientConfig.baseUrl}/posts/${postNumber}`;

  try {
    const response = await fetch(url, {
      method: "DELETE", // 削除なので DELETE メソッド
      headers: { // DELETE リクエストでは Content-Type は不要なことが多い
        Authorization: esaClientConfig.headers.Authorization,
      },
      // body は不要
    });

    if (response.status !== 204) { // 成功は 204 No Content
      const errorBody = await response.text().catch(() =>
        "(Failed to read error body)"
      );
      console.error(
        `[API Error] Failed to delete post #${postNumber}: ${response.status} ${response.statusText}`,
        `URL: ${url}`,
      );
      // 存在しない記事を削除しようとした場合も 404 が返るはず
      return err(
        new Error(
          `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
        ),
      );
    }

    return ok(true); // ボディがないので true を返す
  } catch (error) {
    console.error(
      `[Network Error] Failed to delete post #${postNumber}:`,
      error,
    );
    return err(
      error instanceof Error ? error : new Error("Unknown network error"),
    );
  }
}

// --- ここまで記事削除関連 ---
