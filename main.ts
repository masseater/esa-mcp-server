import { FastMCP } from "fastmcp";
// Remove direct client imports if no longer needed here
// import { z } from "zod"; // Remove if schemas are fully moved
// Remove client function imports
import { registerUserTools } from "./src/tools/user.ts";
import { registerPostTools } from "./src/tools/posts.ts";

const server = new FastMCP({
    name: "esa-mcp",
    version: "1.0.0",
});

// Register tools using the imported functions
registerUserTools(server);
registerPostTools(server);

// Remove all old server.addTool calls and schema definitions

server.start({
    transportType: "stdio",
});
