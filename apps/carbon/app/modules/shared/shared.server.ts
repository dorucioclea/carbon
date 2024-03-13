import type { Database } from "@carbon/database";
import { redis } from "@carbon/redis";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomFieldsTableType } from "../settings";

export async function getCustomFieldsCacheKey(args?: {
  module?: string;
  table?: string;
}) {
  return `customFields:${args?.module ?? ""}:${args?.table ?? ""}`;
}

export async function getCustomFieldsSchemas(
  client: SupabaseClient<Database>,
  args: {
    module?: string;
    table?: string;
  }
) {
  const key = await getCustomFieldsCacheKey(args);
  let schema: CustomFieldsTableType[] | null = null;

  try {
    schema = JSON.parse((await redis.get(key)) || "null");
  } finally {
    if (schema) {
      return {
        data: schema as CustomFieldsTableType[],
        error: null,
      };
    }

    const query = client.from("customFieldTables").select("*");

    if (args.module) {
      query.eq("module", args.module);
    }

    if (args.table) {
      query.eq("table", args.table);
    }

    const result = await query;
    if (result.data) {
      await redis.set(key, JSON.stringify(result.data));
    }

    return result;
  }
}
