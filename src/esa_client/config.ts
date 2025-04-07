import { load } from "dotenv";

// .env ファイルから環境変数を読み込む
// allowEmptyValues: true にしないと、値がない場合にエラーになることがあるのだ
await load({ export: true, allowEmptyValues: true });

const ESA_TOKEN = Deno.env.get("ESA_TOKEN");
const ESA_TEAM_NAME = Deno.env.get("ESA_TEAM_NAME");

// トークンとチーム名が設定されているか確認するのだ
if (!ESA_TOKEN) {
  console.error("Error: ESA_TOKEN is not defined in the environment.");
  Deno.exit(1); // エラーで終了するのだ
}
if (!ESA_TEAM_NAME) {
  console.error("Error: ESA_TEAM_NAME is not defined in the environment.");
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

// 初期化時にトークンとチーム名の一部を表示 (デバッグ用、必要なら削除)
// 注意: トークン全体をログに出さないようにする！
console.info(`esa.io Client Initialized for team: ${ESA_TEAM_NAME}`);
console.info(
  `Using Token starting with: ${ESA_TOKEN.substring(0, 4)}...`,
);
