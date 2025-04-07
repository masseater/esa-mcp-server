import type { FastMCP } from "fastmcp";
import { z } from "zod";
import { getUserInfo } from "../esa_client/index.ts"; // Updated path

const getUserInfoParams = z.object({});

export function registerUserTools(server: FastMCP): void {
  server.addTool({
    name: "esa_get_user_info",
    description: "Get the authenticated user's information from esa.io.",
    parameters: getUserInfoParams,
    async execute(
      _params: z.infer<typeof getUserInfoParams>,
      { log },
    ): Promise<string> {
      log.info("Executing esa_get_user_info tool...");
      try {
        const result = await getUserInfo();
        if (result.ok) {
          log.info("esa_get_user_info tool execution successful.");
          return JSON.stringify(result.value, null, 2);
        } else {
          log.error(`esa_get_user_info failed: ${result.error.message}`);
          throw new Error(`Failed to get user info: ${result.error.message}`);
        }
      } catch (toolError) {
        log.error(`Error during esa_get_user_info execution: ${toolError}`);
        throw toolError;
      }
    },
  });
}
