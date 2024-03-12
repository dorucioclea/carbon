import type { Database, Json } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { SUPABASE_API_URL } from "~/config/env";
import type { GenericQueryFilters } from "~/utils/query";
import { setGenericQueryFilters } from "~/utils/query";
import { interpolateSequenceDate } from "~/utils/string";
import { sanitize } from "~/utils/supabase";
import type {
  companyValidator,
  customFieldValidator,
  sequenceValidator,
  themeValidator,
} from "./settings.models";

export async function getCompany(client: SupabaseClient<Database>) {
  const company = await client.from("company").select("*").single();
  if (company.error) {
    return company;
  }

  return {
    data: {
      ...company.data,
      logo: company.data.logo
        ? `${SUPABASE_API_URL}/storage/v1/object/public/public/${company.data.logo}`
        : null,
    },
    error: null,
  };
}

export async function getCurrentSequence(
  client: SupabaseClient<Database>,
  table: string
) {
  const sequence = await getSequence(client, table);
  if (sequence.error) {
    return sequence;
  }

  const { prefix, suffix, next, size } = sequence.data;

  const currentSequence = next.toString().padStart(size, "0");
  const derivedPrefix = interpolateSequenceDate(prefix);
  const derivedSuffix = interpolateSequenceDate(suffix);

  return {
    data: `${derivedPrefix}${currentSequence}${derivedSuffix}`,
    error: null,
  };
}

export async function getCustomField(
  client: SupabaseClient<Database>,
  id: string
) {
  return client.from("customField").select("*").eq("id", id).single();
}

export async function getCustomFields(
  client: SupabaseClient<Database>,
  id: string
) {
  return client.from("customFieldTables").select("*").eq("id", id).single();
}

export async function getCustomFieldsTables(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    name: string | null;
  }
) {
  let query = client.from("customFieldTables").select("*", {
    count: "exact",
  });

  if (args.name) {
    query = query.ilike("name", `%${args.name}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "name", ascending: true },
  ]);
  return query;
}

export async function getIntegration(
  client: SupabaseClient<Database>,
  id: string
) {
  return client
    .from("integration")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
    .single();
}

export async function getIntegrations(client: SupabaseClient<Database>) {
  return client
    .from("integration")
    .select("*")
    .eq("visible", true)
    .order("title");
}

export async function getNextSequence(
  client: SupabaseClient<Database>,
  table: string,
  userId: string
) {
  const sequence = await getSequence(client, table);
  if (sequence.error) {
    return sequence;
  }

  const { prefix, suffix, next, size, step } = sequence.data;

  const nextValue = next + step;
  const nextSequence = nextValue.toString().padStart(size, "0");
  const derivedPrefix = interpolateSequenceDate(prefix);
  const derivedSuffix = interpolateSequenceDate(suffix);

  const update = await updateSequence(client, table, {
    next: nextValue,
    updatedBy: userId,
  });

  if (update.error) {
    return update;
  }

  return {
    data: `${derivedPrefix}${nextSequence}${derivedSuffix}`,
    error: null,
  };
}

export async function getSequence(
  client: SupabaseClient<Database>,
  table: string
) {
  return client.from("sequence").select("*").eq("table", table).single();
}

export async function getSequences(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    name: string | null;
  }
) {
  let query = client.from("sequence").select("*", {
    count: "exact",
  });

  if (args.name) {
    query = query.ilike("name", `%${args.name}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "table", ascending: true },
  ]);
  return query;
}

export async function getSequencesList(
  client: SupabaseClient<Database>,
  table: string
) {
  return client.from("sequence").select("id").eq("table", table).order("table");
}

export async function getTheme(client: SupabaseClient<Database>) {
  return client.from("theme").select("*").single();
}

export async function insertCompany(
  client: SupabaseClient<Database>,
  company: z.infer<typeof companyValidator>
) {
  return client.from("company").insert(company);
}

export async function insertCustomField(
  client: SupabaseClient<Database>,
  customField: Omit<z.infer<typeof customFieldValidator>, "id"> & {
    createdBy: string;
  }
) {
  // TODO: the new version of supabase client has a max function
  const sortOrders = await client
    .from("customField")
    .select("sortOrder")
    .eq("customFieldTableId", customField.customFieldTableId);

  if (sortOrders.error) return sortOrders;
  const maxSortOrder = sortOrders.data.reduce((max, item) => {
    return Math.max(max, item.sortOrder);
  }, 0);

  return client
    .from("customField")
    .upsert([{ ...customField, sortOrder: maxSortOrder + 1 }])
    .select("id")
    .single();
}

export async function rollbackNextSequence(
  client: SupabaseClient<Database>,
  table: string,
  userId: string
) {
  const sequence = await getSequence(client, table);
  if (sequence.error) {
    return sequence;
  }

  const { next } = sequence.data;

  const nextValue = next - 1;

  return await updateSequence(client, table, {
    next: nextValue,
    updatedBy: userId,
  });
}

export async function updateCompany(
  client: SupabaseClient<Database>,
  company: Partial<z.infer<typeof companyValidator>> & {
    updatedBy: string;
  }
) {
  return client.from("company").update(sanitize(company)).eq("id", true);
}

export async function updateCustomField(
  client: SupabaseClient<Database>,
  customField: Omit<z.infer<typeof customFieldValidator>, "id"> & {
    id: string;
    updatedBy: string;
  }
) {
  if (!customField.id) throw new Error("id is required");
  return client
    .from("customField")
    .update(
      sanitize({
        ...customField,
        updatedBy: customField.updatedBy,
      })
    )
    .eq("id", customField.id);
}

export async function updateCustomFieldsSortOrder(
  client: SupabaseClient<Database>,
  updates: {
    id: string;
    sortOrder: number;
    updatedBy: string;
  }[]
) {
  const updatePromises = updates.map(({ id, sortOrder, updatedBy }) =>
    client.from("customField").update({ sortOrder, updatedBy }).eq("id", id)
  );
  return Promise.all(updatePromises);
}

export async function updateIntegration(
  client: SupabaseClient<Database>,
  update: {
    id: string;
    active: boolean;
    metadata: Json;
    updatedBy: string;
  }
) {
  const { id, ...data } = update;
  return client.from("integration").update(data).eq("id", id);
}

export async function updateLogo(
  client: SupabaseClient<Database>,
  logo: string | null
) {
  return client
    .from("company")
    .update(
      sanitize({
        logo,
      })
    )
    .eq("id", true);
}

export async function updateSequence(
  client: SupabaseClient<Database>,
  table: string,
  sequence: Partial<z.infer<typeof sequenceValidator>> & {
    updatedBy: string;
  }
) {
  return client.from("sequence").update(sanitize(sequence)).eq("table", table);
}

export async function updateTheme(
  client: SupabaseClient<Database>,
  theme: z.infer<typeof themeValidator> & { updatedBy: string }
) {
  return client.from("theme").update(theme).eq("id", true);
}
