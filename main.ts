import { FastMCP } from "fastmcp";
import { load } from "dotenv";
import { registerEsaTools } from "./src/tools/registration.ts";

async function main() {
    await load({ export: true, allowEmptyValues: true });

    const server = new FastMCP({
        name: "esa-mcp-server",
        version: "0.1.0",
    });

    registerEsaTools(server);

    await server.start({
        transportType: "stdio",
    });
}

if (import.meta.main) {
    await load({ export: true, allowEmptyValues: true });
    main().catch(() => {
        // エラーは FastMCP が処理するので、ここでは何もしないのだ
    });
}
