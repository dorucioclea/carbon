import type { Database, Json } from "@carbon/database";
import { redis } from "@carbon/redis";
import { redirect } from "@remix-run/node";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRole } from "~/lib/supabase";
import { getSupplierContact } from "~/modules/purchasing";
import { getCustomerContact } from "~/modules/sales";
import {
  getPermissionsByEmployeeType,
  type EmployeeRow,
  type EmployeeTypePermission,
  type Feature,
  type Permission,
  type User,
} from "~/modules/users";
import {
  deleteAuthAccount,
  sendInviteByEmail,
  sendMagicLink,
} from "~/services/auth/auth.server";
import { flash, requireAuthSession } from "~/services/session.server";
import type { ListItem, Result } from "~/types";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function addUserToCompany(
  client: SupabaseClient<Database>,
  userToCompany: {
    userId: string;
    companyId: number;
  }
) {
  return client.from("userToCompany").insert(userToCompany);
}

export async function createCustomerAccount(
  client: SupabaseClient<Database>,
  {
    id,
    customerId,
  }: {
    id: string;
    customerId: string;
  }
): Promise<Result> {
  const customerContact = await getCustomerContact(client, id);
  if (
    customerContact.error ||
    customerContact.data === null ||
    Array.isArray(customerContact.data.contact) ||
    customerContact.data.contact === null
  ) {
    return error(customerContact.error, "Failed to get customer contact");
  }

  const { email, firstName, lastName } = customerContact.data.contact;

  // TODO: convert to transaction and call this at the end of the transaction
  const invitation = await sendInviteByEmail(email);

  if (invitation.error)
    return error(invitation.error.message, "Failed to send invitation email");

  const userId = invitation.data.user.id;

  const claims = makeCustomerClaims();
  const claimsUpdate = await setUserClaims(userId, {
    role: "customer",
    ...claims,
  });
  if (claimsUpdate.error) {
    await deleteAuthAccount(userId);
    return error(claimsUpdate.error, "Failed to set user claims");
  }

  const insertUser = await createUser(client, {
    id: userId,
    email,
    firstName,
    lastName,
    avatarUrl: null,
  });

  if (insertUser.error)
    return error(insertUser.error, "Failed to create a new user");

  if (!insertUser.data)
    return error(insertUser, "No data returned from create user");

  const updateContact = await client
    .from("customerContact")
    .update({ userId })
    .eq("id", id);
  if (updateContact.error) {
    await deleteAuthAccount(userId);
    return error(updateContact.error, "Failed to update customer contact");
  }

  const generatedId = Array.isArray(insertUser.data)
    ? insertUser.data[0].id
    : // @ts-ignore
      insertUser.data?.id!;

  const createCustomerAccount = await insertCustomerAccount(client, {
    id: generatedId,
    customerId,
  });

  if (createCustomerAccount.error)
    return error(createCustomerAccount.error, "Failed to create an employee");

  return success("Customer account created");
}

export async function createEmployeeAccount(
  client: SupabaseClient<Database>,
  {
    email,
    firstName,
    lastName,
    employeeType,
    companyId,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    employeeType: string;
    companyId: number;
  }
): Promise<Result> {
  const employeeTypePermissions = await getPermissionsByEmployeeType(
    client,
    employeeType
  );
  if (employeeTypePermissions.error)
    return error(
      employeeTypePermissions.error,
      "Failed to get employee type permissions"
    );

  // TODO: convert to transaction and call this at the end of the transaction
  const invitation = await sendInviteByEmail(email);

  if (invitation.error)
    return error(invitation.error.message, "Failed to send invitation email");

  const userId = invitation.data.user.id;

  const claims = makeClaimsFromEmployeeType(employeeTypePermissions);
  const claimsUpdate = await setUserClaims(userId, {
    role: "employee",
    ...claims,
  });
  if (claimsUpdate.error) {
    await deleteAuthAccount(userId);
    return error(claimsUpdate.error, "Failed to set user claims");
  }

  const insertUser = await createUser(client, {
    id: userId,
    email,
    firstName,
    lastName,
    avatarUrl: null,
  });

  if (insertUser.error)
    return error(insertUser.error, "Failed to create a new user");

  if (!insertUser.data)
    return error(insertUser, "No data returned from create user");

  const createEmployee = await insertEmployee(client, {
    id: insertUser.data[0].id,
    employeeTypeId: employeeType,
    companyId,
  });

  if (createEmployee.error)
    return error(createEmployee.error, "Failed to create an employee");

  return success("Employee account created");
}

export async function createSupplierAccount(
  client: SupabaseClient<Database>,
  {
    id,
    supplierId,
  }: {
    id: string;
    supplierId: string;
  }
): Promise<Result> {
  const supplierContact = await getSupplierContact(client, id);
  if (
    supplierContact.error ||
    supplierContact.data === null ||
    Array.isArray(supplierContact.data.contact) ||
    supplierContact.data.contact === null
  ) {
    return error(supplierContact.error, "Failed to get supplier contact");
  }

  const { email, firstName, lastName } = supplierContact.data.contact;

  // TODO: convert to transaction and call this at the end of the transaction
  const invitation = await sendInviteByEmail(email);

  if (invitation.error)
    return error(invitation.error.message, "Failed to send invitation email");

  const userId = invitation.data.user.id;

  const claims = makeSupplierClaims();
  const claimsUpdate = await setUserClaims(userId, {
    role: "supplier",
    ...claims,
  });
  if (claimsUpdate.error) {
    await deleteAuthAccount(userId);
    return error(claimsUpdate.error, "Failed to set user claims");
  }

  const insertUser = await createUser(client, {
    id: userId,
    email,
    firstName,
    lastName,
    avatarUrl: null,
  });

  if (insertUser.error)
    return error(insertUser.error, "Failed to create a new user");

  if (!insertUser.data)
    return error(insertUser, "No data returned from create user");

  const updateContact = await client
    .from("supplierContact")
    .update({ userId })
    .eq("id", id);
  if (updateContact.error) {
    await deleteAuthAccount(userId);
    return error(updateContact.error, "Failed to update supplier contact");
  }

  const createSupplierAccount = await insertSupplierAccount(client, {
    id: insertUser.data[0].id,
    supplierId,
  });

  if (createSupplierAccount.error)
    return error(createSupplierAccount.error, "Failed to create an employee");

  return success("Supplier account created");
}

async function createUser(
  client: SupabaseClient<Database>,
  user: Omit<User, "fullName">
) {
  const { data, error } = await insertUser(client, user);

  if (error) {
    await deleteAuthAccount(user.id);
  }

  return { data, error };
}

export async function deactivateUser(
  client: SupabaseClient<Database>,
  userId: string
): Promise<Result> {
  const updateActiveStatus = await client
    .from("user")
    .update({ active: false })
    .eq("id", userId);
  if (updateActiveStatus.error) {
    return error(updateActiveStatus.error, "Failed to deactivate user");
  }
  const randomPassword = Math.random().toString(36).slice(-8);
  const updatePassword = await resetPassword(userId, randomPassword);

  if (updatePassword.error) {
    return error(updatePassword.error, "Failed to deactivate user");
  }

  return success("Sucessfully deactivated user");
}

export async function getClaims(client: SupabaseClient<Database>, uid: string) {
  return client.rpc("get_claims", { uid });
}

export async function getCurrentUser(
  request: Request,
  client: SupabaseClient<Database>
) {
  const { userId } = await requireAuthSession(request);

  const user = await getUser(client, userId);
  if (user?.error || user?.data === null) {
    throw redirect(
      path.to.authenticatedRoot,
      await flash(request, error(user.error, "Failed to get user"))
    );
  }

  return user.data;
}

function getPermissionCacheKey(userId: string) {
  return `permissions:${userId}`;
}

export async function getUser(client: SupabaseClient<Database>, id: string) {
  return client
    .from("user")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();
}

export async function getUserByEmail(email: string) {
  return getSupabaseServiceRole()
    .from("user")
    .select("*")
    .eq("email", email)
    .single();
}

export async function getUserClaims(request: Request) {
  const { userId } = await requireAuthSession(request);

  let claims: {
    permissions: Record<string, Permission>;
    role: string | null;
  } | null = null;

  try {
    claims = JSON.parse(
      (await redis.get(getPermissionCacheKey(userId))) || "null"
    );
  } finally {
    // if we don't have permissions from redis, get them from the database
    if (!claims) {
      // TODO: remove service role from here, and move it up a level
      const rawClaims = await getClaims(getSupabaseServiceRole(), userId);
      if (rawClaims.error || rawClaims.data === null) {
        throw redirect(
          path.to.authenticatedRoot,
          await flash(
            request,
            error(rawClaims.error, "Failed to get rawClaims")
          )
        );
      }
      // convert rawClaims to permissions
      claims = makePermissionsFromClaims(rawClaims.data as Json[]);

      // store claims in redis
      await redis.set(getPermissionCacheKey(userId), JSON.stringify(claims));

      if (!claims) {
        throw redirect(
          path.to.authenticatedRoot,
          await flash(request, error(rawClaims, "Failed to parse claims"))
        );
      }
    }

    return claims;
  }
}

export async function getUserGroups(
  client: SupabaseClient<Database>,
  userId: string
) {
  return client.rpc("groups_for_user", { uid: userId });
}

export async function getUserDefaults(
  client: SupabaseClient<Database>,
  userId: string,
  companyId: number
) {
  return client
    .from("userDefaults")
    .select("*")
    .eq("userId", userId)
    .eq("companyId", companyId)
    .maybeSingle();
}

async function insertCustomerAccount(
  client: SupabaseClient<Database>,
  customerAccount: {
    id: string;
    customerId: string;
  }
) {
  return client
    .from("customerAccount")
    .insert(customerAccount)
    .select("id")
    .single();
}

export async function insertEmployee(
  client: SupabaseClient<Database>,
  employee: EmployeeRow
) {
  return client.from("employee").insert([employee]).select("*").single();
}

async function insertSupplierAccount(
  client: SupabaseClient<Database>,
  supplierAccount: {
    id: string;
    supplierId: string;
  }
) {
  return client
    .from("supplierAccount")
    .insert(supplierAccount)
    .select("id")
    .single();
}

async function insertUser(
  client: SupabaseClient<Database>,
  //TODO: fix this type
  user: Omit<User, "fullName" | "createdAt">
) {
  return client.from("user").insert([user]).select("*");
}

function makeClaimsFromEmployeeType({
  data,
}: {
  data: {
    view: number[];
    create: number[];
    update: number[];
    delete: number[];
    feature: ListItem | ListItem[] | null;
  }[];
}) {
  const claims: Record<string, number[]> = {};

  data.forEach((permission) => {
    if (permission.feature === null || Array.isArray(permission.feature)) {
      throw new Error(
        `TODO: permission.feature is an array or null for permission ${JSON.stringify(
          permission,
          null,
          2
        )}`
      );
    }

    const module = permission.feature.name.toLowerCase();

    claims[`${module}_view`] = permission.view;
    claims[`${module}_create`] = permission.create;
    claims[`${module}_update`] = permission.update;
    claims[`${module}_delete`] = permission.delete;
  });

  return claims;
}

function isClaimPermission(key: string, value: unknown) {
  const action = key.split("_")[1];
  return (
    action !== undefined &&
    ["view", "create", "update", "delete"].includes(action) &&
    Array.isArray(value)
  );
}

function makeCustomerClaims() {
  // TODO: this should be more dynamic
  const claims: Record<string, boolean> = {
    documents_view: true,
    jobs_view: true,
    sales_view: true,
    parts_view: true,
  };

  return claims;
}

export function makeEmptyPermissionsFromFeatures(data: Feature[]) {
  return data.reduce<Record<string, { id: string; permission: Permission }>>(
    (acc, module) => {
      acc[module.name] = {
        id: module.id,
        permission: {
          view: [],
          create: [],
          update: [],
          delete: [],
        },
      };
      return acc;
    },
    {}
  );
}

export function makePermissionsFromClaims(claims: Json[] | null) {
  if (typeof claims !== "object" || claims === null) return null;
  let permissions: Record<string, Permission> = {};
  let role: string | null = null;

  Object.entries(claims).forEach(([key, value]) => {
    if (isClaimPermission(key, value)) {
      const [module, action] = key.split("_");
      if (!(module in permissions)) {
        permissions[module] = {
          view: [],
          create: [],
          update: [],
          delete: [],
        };
      }

      switch (action) {
        case "view":
          permissions[module]["view"] = value as number[];
          break;
        case "create":
          permissions[module]["create"] = value as number[];
          break;
        case "update":
          permissions[module]["update"] = value as number[];
          break;
        case "delete":
          permissions[module]["delete"] = value as number[];
          break;
      }
    }
  });

  if ("role" in claims) {
    role = claims["role"] as string;
  }

  return { permissions, role };
}

export function makePermissionsFromEmployeeType(
  data: EmployeeTypePermission[]
) {
  const result: Record<string, { id: string; permission: Permission }> = {};
  if (!data) return result;
  data.forEach((permission) => {
    if (Array.isArray(permission.feature) || !permission.feature) {
      // hmm... TODO: handle this
      throw new Error(
        `TODO: permission.Feature is an array or null for permission ${JSON.stringify(
          permission,
          null,
          2
        )}`
      );
    } else {
      result[permission.feature.name] = {
        id: permission?.feature?.id!,
        permission: {
          view: permission.view,
          create: permission.create,
          update: permission.update,
          delete: permission.delete,
        },
      };
    }
  });

  return result;
}

function makeSupplierClaims() {
  // TODO: this should be more dynamic
  const claims: Record<string, boolean> = {
    documents_view: true,
    purchasing_view: true,
    parts_view: true,
  };

  return claims;
}

export async function resendInvite(
  client: SupabaseClient<Database>,
  userId: string
): Promise<Result> {
  const user = await getUser(client, userId);
  if (user.error || !user.data) {
    return error(user.error, "Failed to get user");
  }

  const invite = await sendMagicLink(user.data.email);
  if (invite.error) {
    return error(invite.error, "Failed to send invite");
  }

  return success("Succesfully sent invite");
}

export async function resetPassword(userId: string, password: string) {
  return getSupabaseServiceRole().auth.admin.updateUserById(userId, {
    password,
  });
}

async function setUserClaims(
  userId: string,
  claims: Record<string, number[] | string>
) {
  return getSupabaseServiceRole().auth.admin.updateUserById(userId, {
    app_metadata: claims,
  });
}

export async function updateEmployee(
  client: SupabaseClient<Database>,
  {
    id,
    employeeType,
    permissions,
  }: {
    id: string;
    employeeType: string;
    permissions: Record<string, Permission>;
  }
): Promise<Result> {
  const updateEmployeeEmployeeType = await client
    .from("employee")
    .upsert([{ id, employeeTypeId: employeeType }]);

  if (updateEmployeeEmployeeType.error)
    return error(updateEmployeeEmployeeType.error, "Failed to update employee");

  return updatePermissions(client, { id, permissions });
}

export async function updatePermissions(
  client: SupabaseClient<Database>,
  {
    id,
    permissions,
    addOnly = false,
  }: { id: string; permissions: Record<string, Permission>; addOnly?: boolean }
): Promise<Result> {
  if (await client.rpc("is_claims_admin")) {
    const claims = await getClaims(client, id);

    if (claims.error) return error(claims.error, "Failed to get claims");

    const currentClaims =
      typeof claims.data !== "object" ||
      Array.isArray(claims.data) ||
      claims.data === null
        ? {}
        : claims.data;

    const newClaims: Record<string, number[]> = {};
    Object.entries(permissions).forEach(([name, permission]) => {
      const module = name.toLowerCase();
      if (!addOnly || permission.view)
        newClaims[`${module}_view`] = permission.view;
      if (!addOnly || permission.create)
        newClaims[`${module}_create`] = permission.create;
      if (!addOnly || permission.update)
        newClaims[`${module}_update`] = permission.update;
      if (!addOnly || permission.delete)
        newClaims[`${module}_delete`] = permission.delete;
    });

    const claimsUpdate = await setUserClaims(id, {
      ...(currentClaims as Record<string, number[]>),
      ...(newClaims as Record<string, number[]>),
    });
    if (claimsUpdate.error)
      return error(claimsUpdate.error, "Failed to update claims");

    await redis.del(getPermissionCacheKey(id));

    return success("Permissions updated");
  } else {
    return error(null, "You do not have permission to update permissions");
  }
}
