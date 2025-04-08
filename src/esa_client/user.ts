import { esaClientConfig } from "./config.ts";
import type { EsaUser, Result } from "./types.ts";
import { err, ok } from "./types.ts";

export async function getUserInfo(): Promise<Result<EsaUser, Error>> {
    const url = `https://api.esa.io/v1/user`; // User API endpoint is fixed
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

        const user: EsaUser = await response.json();
        return ok(user);
    } catch (error) {
        return err(
            error instanceof Error ? error : new Error("Unknown network error"),
        );
    }
}
