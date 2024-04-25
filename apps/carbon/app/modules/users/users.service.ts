import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import logger from "~/lib/logger";
import type { GenericQueryFilters } from "~/utils/query";
import { setGenericQueryFilters } from "~/utils/query";
import type { Permission } from "./types";

export async function deleteEmployeeType(
  client: SupabaseClient<Database>,
  employeeTypeId: string
) {
  return client.from("employeeType").delete().eq("id", employeeTypeId);
}

export async function deleteGroup(
  client: SupabaseClient<Database>,
  groupId: string
) {
  return client.from("group").delete().eq("id", groupId);
}

export async function getCompaniesForUser(
  client: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await client
    .from("userToCompany")
    .select("companyId")
    .eq("userId", userId);

  if (error) {
    logger.error(error, `Failed to get companies for user ${userId}`);
    return [];
  }

  return data?.map((row) => row.companyId) ?? [];
}

export async function getCustomers(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
  }
) {
  // TODO: this breaks on customerType filters -- convert to view
  let query = client.from("customerAccount").select(
    `user!inner(id, fullName, firstName, lastName, email, avatarUrl, active), 
      customer!inner(name, customerType!left(name))`,
    { count: "exact" }
  );

  if (args.search) {
    query = query.ilike("user.fullName", `%${args.search}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "user(lastName)", ascending: true },
  ]);
  return query;
}

export async function getEmployee(
  client: SupabaseClient<Database>,
  id: string
) {
  return client
    .from("employee")
    .select("id, user(id, firstName, lastName, email), employeeType(id)")
    .eq("id", id)
    .single();
}

export async function getEmployees(
  client: SupabaseClient<Database>,
  companyId: number,
  args: GenericQueryFilters & {
    search: string | null;
  }
) {
  // TODO: convert to view
  let query = client
    .from("employee")
    .select(
      "user!inner(id, fullName, firstName, lastName, email, avatarUrl, active), employeeType!inner(name)",
      { count: "exact" }
    );

  if (args.search) {
    query = query.ilike("user.fullName", `%${args.search}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "user(lastName)", ascending: true },
  ]);
  return query;
}

export async function getEmployeeType(
  client: SupabaseClient<Database>,
  employeeTypeId: string
) {
  return client
    .from("employeeType")
    .select("*")
    .eq("id", employeeTypeId)
    .single();
}

export async function getEmployeeTypes(
  client: SupabaseClient<Database>,
  companyId: number,
  args?: GenericQueryFilters & { search: string | null }
) {
  let query = client
    .from("employeeType")
    .select("*", { count: "exact" })
    .eq("companyId", companyId);

  if (args?.search) {
    query = query.ilike("name", `%${args.search}%`);
  }

  if (args) {
    query = setGenericQueryFilters(query, args, [
      { column: "name", ascending: true },
    ]);
  }

  return query;
}

export async function getFeatures(client: SupabaseClient<Database>) {
  return client.from("feature").select("id, name").order("name");
}

export async function getGroup(
  client: SupabaseClient<Database>,
  groupId: string
) {
  return client.from("group").select("id, name").eq("id", groupId).single();
}

export async function getGroupMembers(
  client: SupabaseClient<Database>,
  groupId: string
) {
  return client
    .from("groupMembers")
    .select("name, groupId, memberGroupId, memberUserId")
    .eq("groupId", groupId);
}

export async function getGroups(
  client: SupabaseClient<Database>,
  args?: GenericQueryFilters & {
    search: string | null;
    uid: string | null;
  }
) {
  let query = client.rpc("groups_query", {
    _uid: args?.uid ?? "",
    _name: args?.search ?? "",
  });

  if (args) query = setGenericQueryFilters(query, args);

  return query;
}

export async function getPermissionsByEmployeeType(
  client: SupabaseClient<Database>,
  employeeTypeId: string
) {
  return client
    .from("employeeTypePermission")
    .select("view, create, update, delete, feature (id, name)")
    .eq("employeeTypeId", employeeTypeId);
}

export async function getSuppliers(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
  }
) {
  // TODO: this breaks on supplierType filters -- convert to view
  let query = client.from("supplierAccount").select(
    `user!inner(id, fullName, firstName, lastName, email, avatarUrl, active), 
      supplier!inner(name, supplierType!left(name))`,
    { count: "exact" }
  );

  if (args.search) {
    query = query.ilike("user.fullName", `%${args.search}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "user(lastName)", ascending: true },
  ]);
  return query;
}

export async function getUsers(client: SupabaseClient<Database>) {
  return client
    .from("user")
    .select("id, firstName, lastName, fullName, email, avatarUrl")
    .eq("active", true)
    .order("lastName");
}

export async function insertEmployeeType(
  client: SupabaseClient<Database>,
  employeeType: { id?: string; name: string; color?: string }
) {
  return client
    .from("employeeType")
    .insert([employeeType])
    .select("id")
    .single();
}

export async function insertGroup(
  client: SupabaseClient<Database>,
  group: { name: string }
) {
  return client.from("group").insert(group).select("*").single();
}

export async function upsertEmployeeType(
  client: SupabaseClient<Database>,
  employeeType: { id?: string; name: string; color?: string }
) {
  return client
    .from("employeeType")
    .upsert([employeeType])
    .select("id")
    .single();
}

export async function upsertEmployeeTypePermissions(
  client: SupabaseClient<Database>,
  employeeTypeId: string,
  permissions: { id: string; permission: Permission }[]
) {
  const employeeTypePermissions = permissions.map(({ id, permission }) => ({
    employeeTypeId,
    featureId: id,
    view: permission.view,
    create: permission.create,
    update: permission.update,
    delete: permission.delete,
  }));

  return client.from("employeeTypePermission").upsert(employeeTypePermissions);
}

export async function upsertGroup(
  client: SupabaseClient<Database>,
  {
    id,
    name,
  }: {
    id: string;
    name: string;
  }
) {
  return client.from("group").upsert([{ id, name }]);
}

export async function upsertGroupMembers(
  client: SupabaseClient<Database>,
  groupId: string,
  selections: string[]
) {
  const deleteExisting = await client
    .from("membership")
    .delete()
    .eq("groupId", groupId);

  if (deleteExisting.error) return deleteExisting;

  // separate each id according to whether it is a group or a user
  const memberGroups = selections
    .filter((id) => id.startsWith("group_"))
    .map((id) => ({
      groupId,
      memberGroupId: id.slice(6),
    }));

  const memberUsers = selections
    .filter((id) => id.startsWith("user_"))
    .map((id) => ({
      groupId,
      memberUserId: id.slice(5),
    }));

  return client.from("membership").insert([...memberGroups, ...memberUsers]);
}
