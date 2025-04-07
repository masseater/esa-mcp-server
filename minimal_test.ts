import { FastMCP } from "npm:fastmcp@1.21.0"; // バージョンは deno add で入ったものに合わせる
import { z } from "npm:zod@3.24.2"; // バージョンは deno add で入ったものに合わせる

const server = new FastMCP({
  name: "Sample FastMCP Server",
  version: "1.0.0",
});

server.addTool({
  name: "Count String Length",
  description: "Count the length of a string",
  parameters: z.object({
    string: z.string(),
  }),
  execute: async (params: { string: string }) => { // async を追加
    const length = params.string.length;
    // execute は Promise<string> を返す必要があるので調整
    return JSON.stringify({ length }); // Promise.resolve は不要かも
  },
});

server.start({
  transportType: "stdio",
});
