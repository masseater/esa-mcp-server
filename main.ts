import { FastMCP } from "fastmcp";
import { load } from "dotenv";
import { registerEsaTools } from "./src/tools/registration.ts";
// import { registerPostTools } from "./src/tools/posts.ts";
// import { registerUserTools } from "./src/tools/user.ts";

async function main() {
    // Load environment variables from .env file
    await load({ export: true, allowEmptyValues: true });

    // Create FastMCP server instance with config
    const server = new FastMCP({
        name: "esa-mcp-server", // Provide a name
        version: "0.1.0", // Provide a version
    });

    // Register all tools using the unified function
    registerEsaTools(server);

    // Old registration calls - remove these
    // server.log.info("Registering Post tools...");
    // registerPostTools(server);
    // server.log.info("Registering User tools...");
    // registerUserTools(server);

    // Start the server using stdio transport
    await server.start({
        transportType: "stdio",
    });
}

if (import.meta.main) {
    main().catch((err) => {
        Deno.exit(1);
    });
}
