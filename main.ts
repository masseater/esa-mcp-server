import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema
import { registerEsaTools } from "./src/tools/registration.ts";

const server = new FastMCP({
    name: "esa-mcp-server",
    version: "1.0.0",
});

/*
server.addTool({
    name: "add",
    description: "Add two numbers",
    parameters: z.object({
        a: z.number(),
        b: z.number(),
    }),
    execute: async (args) => {
        return String(args.a + args.b);
    },
});
*/

server.addTool({
    name: "echo",
    description: "Echoes the input string",
    parameters: z.object({
        message: z.string(),
    }),
    execute: (args) => {
        // MCP サーバーの execute 関数内では console.log は使わず、
        // 第2引数から log を受け取って使うのだ (カスタム指示参照)
        // 今回はログ出力は不要なのだ
        return Promise.resolve(args.message);
    },
});

registerEsaTools(server);

await server.start({
    transportType: "stdio",
});
