import logger from "~/lib/logger";
import type { Result } from "~/types";

export function error(error: any, message = "Request failed"): Result {
  if (error) logger.error({ error, message });

  const details =
    typeof error === "object" && error !== null && "message" in error
      ? (error.message as string)
      : undefined;

  return {
    success: false,
    message: details ? `${message}: ${details}` : message,
  };
}

export function success(message = "Request succeeded"): Result {
  return {
    success: true,
    message,
  };
}
