import { load } from "dotenv";

await load({ export: true, allowEmptyValues: true });

const ESA_TOKEN = Deno.env.get("ESA_TOKEN");
const ESA_TEAM_NAME = Deno.env.get("ESA_TEAM_NAME");

if (!ESA_TOKEN) {
    throw new Error("Error: ESA_TOKEN is not defined in the environment.");
}
if (!ESA_TEAM_NAME) {
    throw new Error("Error: ESA_TEAM_NAME is not defined in the environment.");
}

const BASE_URL = `https://api.esa.io/v1/teams/${ESA_TEAM_NAME}`;
const AUTH_HEADERS = {
    Authorization: `Bearer ${ESA_TOKEN}`,
    "Content-Type": "application/json",
};

export const esaClientConfig = {
    baseUrl: BASE_URL,
    headers: AUTH_HEADERS,
};
