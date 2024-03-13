import type { Database } from "@carbon/database";
import { redis } from "@carbon/redis";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomFieldsTableType } from "../settings";

export async function deleteNote(
  client: SupabaseClient<Database>,
  noteId: string
) {
  return client.from("note").update({ active: false }).eq("id", noteId);
}

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

export async function getNotes(
  client: SupabaseClient<Database>,
  documentId: string
) {
  return client
    .from("note")
    .select("id, note, createdAt, user(id, fullName, avatarUrl)")
    .eq("documentId", documentId)
    .eq("active", true)
    .order("createdAt");
}

export async function insertNote(
  client: SupabaseClient<Database>,
  note: {
    note: string;
    documentId: string;
    createdBy: string;
  }
) {
  return client.from("note").insert([note]).select("*").single();
}

export async function updateNote(
  client: SupabaseClient<Database>,
  id: string,
  note: string
) {
  return client.from("note").update({ note }).eq("id", id);
}
