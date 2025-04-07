import { esaClientConfig } from "./config.ts";
import type { EsaUser, Result } from "./types.ts";
import { err, ok } from "./types.ts";

/**
 * esa.io API から認証されたユーザー情報を取得する関数なのだ
 * 成功/失敗を Result 型で返すように変更したのだ。
 */
export async function getUserInfo(): Promise<Result<EsaUser, Error>> {
  const url = `https://api.esa.io/v1/user`; // User API endpoint is fixed
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: esaClientConfig.headers, // Use headers from config
    });

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => "(Failed to read error body)"); // エラー内容取得失敗も考慮
      return err(
        new Error(
          `API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`,
        ),
      );
    }

    const user: EsaUser = await response.json();
    return ok(user); // ok で成功を示すのだ
  } catch (error) {
    // Handle network errors or other exceptions during fetch
    return err(
      error instanceof Error ? error : new Error("Unknown network error"),
    );
  }
}
