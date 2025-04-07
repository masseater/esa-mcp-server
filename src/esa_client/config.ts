import { load } from "dotenv";

// .env ファイルから環境変数を読み込む
// allowEmptyValues: true にしないと、値がない場合にエラーになることがあるのだ
await load({ export: true, allowEmptyValues: true });

const ESA_TOKEN = Deno.env.get("ESA_TOKEN");
const ESA_TEAM_NAME = Deno.env.get("ESA_TEAM_NAME");

// トークンとチーム名が設定されているか確認するのだ
if (!ESA_TOKEN) {
    throw new Error("Error: ESA_TOKEN is not defined in the environment.");
}
if (!ESA_TEAM_NAME) {
    throw new Error("Error: ESA_TEAM_NAME is not defined in the environment.");
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

// Initialization messages - remove console usage
