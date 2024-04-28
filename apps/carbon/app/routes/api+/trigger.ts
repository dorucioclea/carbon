import { triggerClient } from "~/lib/trigger.server";
import serverRuntime from "@remix-run/server-runtime";
import type { ActionFunction } from "@remix-run/node";

// Job registration has been moved to entry.server.tsx;
export const action: ActionFunction = async ({ request }) => {
  const response = await triggerClient.handleRequest(request);
  if (!response) {
    return serverRuntime.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      }
    );
  }
  return serverRuntime.json(response.body, {
    status: response.status,
    headers: response.headers,
  });
};
