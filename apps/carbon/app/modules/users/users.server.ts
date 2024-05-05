import type { Database, Json } from "@carbon/database";
import { redis } from "@carbon/redis";
import { redirect } from "@remix-run/node";
import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import logger from "~/lib/logger";
import { getSupabaseServiceRole } from "~/lib/supabase";
import { getSupplierContact } from "~/modules/purchasing";
import { getCustomerContact } from "~/modules/sales";
import type {
  CompanyPermission,
  EmployeeRow,
  EmployeeTypePermission,
  Module,
  Permission,
  User,
} from "~/modules/users";
import { getPermissionsByEmployeeType } from "~/modules/users";
import {
  deleteAuthAccount,
  sendInviteByEmail,
  sendMagicLink,
} from "~/services/auth/auth.server";
import { flash, requireAuthSession } from "~/services/session.server";
import type { Result } from "~/types";
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
    companyId,
  }: {
    id: string;
    customerId: string;
    companyId: number;
  }
): Promise<Result> {
  // TODO: convert to transaction and call this at the end of the transaction
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

  const user = await getUserByEmail(email);
  if (user.data) {
    // TODO: user already exists -- send company invite
    await addUserToCompany(client, { userId: user.data.id, companyId });
    return error(
      null,
      "User already exists. Adding to team not implemented yet."
    );
  } else {
    // user does not exist -- create user
    const invitation = await sendInviteByEmail(email);

    if (invitation.error)
      return error(invitation.error.message, "Failed to send invitation email");

    const userId = invitation.data.user.id;

    const claims = makeCustomerClaims(companyId);
    const claimsUpdate = await setUserClaims(userId, {
      role: "customer",
      ...claims,
    });

    if (claimsUpdate.error) {
      await deleteAuthAccount(userId);
      return error(claimsUpdate.error, "Failed to add user");
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

    const [updateContact, createCustomerAccount, userToCompany] =
      await Promise.all([
        client.from("customerContact").update({ userId }).eq("id", id),
        insertCustomerAccount(client, {
          id: userId,
          customerId,
          companyId,
        }),
        addUserToCompany(client, { userId, companyId }),
      ]);

    if (updateContact.error) {
      await deleteAuthAccount(userId);
      return error(updateContact.error, "Failed to update customer contact");
    }

    if (createCustomerAccount.error) {
      await deleteAuthAccount(userId);
      return error(
        createCustomerAccount.error,
        "Failed to create a customer account"
      );
    }

    if (userToCompany.error) {
      await deleteAuthAccount(userId);
      return error(userToCompany.error, "Failed to add user to company");
    }

    return success("Customer account created");
  }
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
  // TODO: convert to transaction and call this at the end of the transaction
  const employeeTypePermissions = await getPermissionsByEmployeeType(
    client,
    employeeType
  );
  if (employeeTypePermissions.error)
    return error(
      employeeTypePermissions.error,
      "Failed to get employee type permissions"
    );

  const user = await getUserByEmail(email);

  if (user.data) {
    // TODO: user already exists -- send company invite
    await addUserToCompany(client, { userId: user.data.id, companyId });
    return error(
      null,
      "User already exists. Adding to team not implemented yet."
    );
  } else {
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
      if (claimsUpdate.error) {
        return error(claimsUpdate.error, "Failed to udpate user claims");
      }
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

    const [createEmployee, userToCompany] = await Promise.all([
      insertEmployee(client, {
        id: insertUser.data[0].id,
        employeeTypeId: employeeType,
        companyId,
      }),
      addUserToCompany(client, { userId, companyId }),
    ]);

    if (createEmployee.error) {
      await deleteAuthAccount(userId);
      return error(createEmployee.error, "Failed to create a employee account");
    }

    if (userToCompany.error) {
      await deleteAuthAccount(userId);
      return error(userToCompany.error, "Failed to add user to company");
    }

    return success("Employee account created");
  }
}

export async function createSupplierAccount(
  client: SupabaseClient<Database>,
  {
    id,
    supplierId,
    companyId,
  }: {
    id: string;
    supplierId: string;
    companyId: number;
  }
): Promise<Result> {
  // TODO: convert to transaction and call this at the end of the transaction
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

  const user = await getUserByEmail(email);
  if (user.data) {
    // TODO: user already exists -- send company invite
    await addUserToCompany(client, { userId: user.data.id, companyId });
    return error(
      null,
      "User already exists. Adding to team not implemented yet."
    );
  } else {
    // user does not exist -- create user
    const invitation = await sendInviteByEmail(email);

    if (invitation.error)
      return error(invitation.error.message, "Failed to send invitation email");

    const userId = invitation.data.user.id;

    const claims = makeSupplierClaims(companyId);
    const claimsUpdate = await setUserClaims(userId, {
      role: "supplier",
      ...claims,
    });
    if (claimsUpdate.error) {
      await deleteAuthAccount(userId);
      return error(claimsUpdate.error, "Failed to create user");
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

    const [updateContact, createSupplierAccount, userToCompany] =
      await Promise.all([
        client.from("supplierContact").update({ userId }).eq("id", id),
        insertSupplierAccount(client, {
          id: insertUser.data[0].id,
          supplierId,
          companyId,
        }),
        addUserToCompany(client, { userId, companyId }),
      ]);

    if (updateContact.error) {
      await deleteAuthAccount(userId);
      return error(updateContact.error, "Failed to update supplier contact");
    }

    if (createSupplierAccount.error) {
      await deleteAuthAccount(userId);
      return error(
        createSupplierAccount.error,
        "Failed to create a supplier account"
      );
    }

    if (userToCompany.error) {
      await deleteAuthAccount(userId);
      return error(userToCompany.error, "Failed to add user to company");
    }

    return success("Supplier account created");
  }
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
    .update({ active: false, firstName: "Deactivate", lastName: "User" })
    .eq("id", userId);
  if (updateActiveStatus.error) {
    return error(updateActiveStatus.error, "Failed to deactivate user");
  }

  const randomPassword = crypto.randomBytes(20).toString("hex");
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

export function getPermissionCacheKey(userId: string) {
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
    .maybeSingle();
}

export async function getUserClaims(userId: string) {
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
        logger.error(rawClaims);
        throw new Error("Failed to get claims");
      }

      // convert rawClaims to permissions
      claims = makePermissionsFromClaims(rawClaims.data as Json[]);

      // store claims in redis
      await redis.set(getPermissionCacheKey(userId), JSON.stringify(claims));

      if (!claims) {
        throw new Error("Failed to get claims");
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
    companyId: number;
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
    companyId: number;
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
    module: string;
  }[];
}) {
  const claims: Record<string, number[]> = {};

  data.forEach((permission) => {
    if (!permission.module) {
      throw new Error(
        `Permission module is missing for permission ${JSON.stringify(data)}`
      );
    }

    const module = permission.module.toLowerCase();

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

function makeCustomerClaims(companyId: number) {
  // TODO: this should be more dynamic
  const claims: Record<string, number[]> = {
    documents_view: [companyId],
    jobs_view: [companyId],
    sales_view: [companyId],
    parts_view: [companyId],
  };

  return claims;
}

export function makeEmptyPermissionsFromModules(data: Module[]) {
  return data.reduce<
    Record<string, { name: string; permission: CompanyPermission }>
  >((acc, m) => {
    if (m.name) {
      acc[m.name] = {
        name: m.name.toLowerCase(),
        permission: {
          view: false,
          create: false,
          update: false,
          delete: false,
        },
      };
    }
    return acc;
  }, {});
}

export function makeCompanyPermissionsFromClaims(
  claims: Json[] | null,
  companyId: number
) {
  if (typeof claims !== "object" || claims === null) return null;
  let permissions: Record<string, CompanyPermission> = {};
  let role: string | null = null;

  Object.entries(claims).forEach(([key, value]) => {
    if (isClaimPermission(key, value)) {
      const [module, action] = key.split("_");
      if (!(module in permissions)) {
        permissions[module] = {
          view: false,
          create: false,
          update: false,
          delete: false,
        };
      }

      if (!Array.isArray(value)) {
        permissions[module] = {
          view: false,
          create: false,
          update: false,
          delete: false,
        };
      } else {
        switch (action) {
          case "view":
            permissions[module]["view"] =
              value.includes(0) || value.includes(companyId);
            break;
          case "create":
            permissions[module]["create"] =
              value.includes(0) || value.includes(companyId);
            break;
          case "update":
            permissions[module]["update"] =
              value.includes(0) || value.includes(companyId);
            break;
          case "delete":
            permissions[module]["delete"] =
              value.includes(0) || value.includes(companyId);
            break;
        }
      }
    }
  });

  if ("role" in claims) {
    role = claims["role"] as string;
  }

  return { permissions, role };
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

export function makeCompanyPermissionsFromEmployeeType(
  data: EmployeeTypePermission[],
  companyId: number
) {
  const result: Record<
    string,
    { name: string; permission: CompanyPermission }
  > = {};
  if (!data) return result;
  data.forEach((permission) => {
    if (!permission.module) {
      throw new Error(
        `Module is missing for permission ${JSON.stringify(permission)}`
      );
    } else {
      result[permission.module] = {
        name: permission.module.toLowerCase(),
        permission: {
          view:
            permission.view.includes(0) || permission.view.includes(companyId),
          create:
            permission.create.includes(0) ||
            permission.create.includes(companyId),
          update:
            permission.update.includes(0) ||
            permission.update.includes(companyId),
          delete:
            permission.delete.includes(0) ||
            permission.delete.includes(companyId),
        },
      };
    }
  });

  return result;
}

function makeSupplierClaims(companyId: number) {
  // TODO: this should be more dynamic
  const claims: Record<string, number[]> = {
    documents_view: [companyId],
    purchasing_view: [companyId],
    parts_view: [companyId],
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
  const client = getSupabaseServiceRole();
  const user = await client.auth.admin.getUserById(userId);
  if (user.error) throw new Error(user.error.message);

  const currentClaims = user.data?.user.app_metadata ?? {};
  const newClaims = { ...currentClaims };

  Object.entries(claims).forEach(([key, value]) => {
    if (key === "role") {
      newClaims["role"] = value;
    }

    if (isClaimPermission(key, value)) {
      if (key in newClaims) {
        newClaims[key] = [...newClaims[key], ...value];
      } else {
        newClaims[key] = value;
      }
    }
  });

  return client.auth.admin.updateUserById(userId, {
    app_metadata: newClaims,
  });
}

export async function updateEmployee(
  client: SupabaseClient<Database>,
  {
    id,
    employeeType,
    permissions,
    companyId,
  }: {
    id: string;
    employeeType: string;
    permissions: Record<string, CompanyPermission>;
    companyId: number;
  }
): Promise<Result> {
  const updateEmployeeEmployeeType = await client
    .from("employee")
    .upsert([{ id, companyId, employeeTypeId: employeeType }]);

  if (updateEmployeeEmployeeType.error)
    return error(updateEmployeeEmployeeType.error, "Failed to update employee");

  return updatePermissions(client, { id, permissions, companyId });
}

export async function updatePermissions(
  client: SupabaseClient<Database>,
  {
    id,
    permissions,
    companyId,
    addOnly = false,
  }: {
    id: string;
    permissions: Record<string, CompanyPermission>;
    companyId: number;
    addOnly?: boolean;
  }
): Promise<Result> {
  if (await client.rpc("is_claims_admin")) {
    const claims = await getClaims(client, id);

    if (claims.error) return error(claims.error, "Failed to get claims");

    const updatedClaims = (
      typeof claims.data !== "object" ||
      Array.isArray(claims.data) ||
      claims.data === null
        ? {}
        : claims.data
    ) as Record<string, number[]>;

    // add any missing claims to the current claims
    Object.keys(permissions).forEach((name) => {
      if (!(`${name}_view` in updatedClaims)) {
        updatedClaims[`${name}_view`] = [];
      }
      if (!(`${name}_create` in updatedClaims)) {
        updatedClaims[`${name}_create`] = [];
      }
      if (!(`${name}_update` in updatedClaims)) {
        updatedClaims[`${name}_update`] = [];
      }
      if (!(`${name}_delete` in updatedClaims)) {
        updatedClaims[`${name}_delete`] = [];
      }
    });

    if (addOnly) {
      Object.entries(permissions).forEach(([name, permission]) => {
        const module = name.toLowerCase();
        if (
          permission.view &&
          !updatedClaims[`${module}_view`]?.includes(companyId)
        ) {
          updatedClaims[`${module}_view`].push(companyId);
        }
        if (
          permission.create &&
          !updatedClaims[`${module}_create`]?.includes(companyId)
        ) {
          updatedClaims[`${module}_create`].push(companyId);
        }
        if (
          permission.update &&
          !updatedClaims[`${module}_update`]?.includes(companyId)
        ) {
          updatedClaims[`${module}_update`].push(companyId);
        }
        if (
          permission.delete &&
          !updatedClaims[`${module}_delete`]?.includes(companyId)
        ) {
          updatedClaims[`${module}_delete`].push(companyId);
        }
      });
    } else {
      Object.entries(permissions).forEach(([name, permission]) => {
        const module = name.toLowerCase();
        if (permission.view) {
          if (!updatedClaims[`${module}_view`]?.includes(companyId)) {
            updatedClaims[`${module}_view`] = [
              ...updatedClaims[`${module}_view`],
              companyId,
            ];
          }
        } else {
          updatedClaims[`${module}_view`] = (
            updatedClaims[`${module}_view`] as number[]
          ).filter((c: number) => c !== companyId);
        }

        if (permission.create) {
          if (!updatedClaims[`${module}_create`]?.includes(companyId)) {
            updatedClaims[`${module}_create`] = [
              ...updatedClaims[`${module}_create`],
              companyId,
            ];
          }
        } else {
          updatedClaims[`${module}_create`] = (
            updatedClaims[`${module}_create`] as number[]
          ).filter((c: number) => c !== companyId);
        }

        if (permission.update) {
          if (!updatedClaims[`${module}_update`]?.includes(companyId)) {
            updatedClaims[`${module}_update`] = [
              ...updatedClaims[`${module}_update`],
              companyId,
            ];
          }
        } else {
          updatedClaims[`${module}_update`] = (
            updatedClaims[`${module}_update`] as number[]
          ).filter((c: number) => c !== companyId);
        }

        if (permission.delete) {
          if (!updatedClaims[`${module}_delete`]?.includes(companyId)) {
            updatedClaims[`${module}_delete`] = [
              ...updatedClaims[`${module}_delete`],
              companyId,
            ];
          }
        } else {
          updatedClaims[`${module}_delete`] = (
            updatedClaims[`${module}_delete`] as number[]
          ).filter((c: number) => c !== companyId);
        }
      });
    }

    const claimsUpdate =
      await getSupabaseServiceRole().auth.admin.updateUserById(id, {
        app_metadata: updatedClaims,
      });
    if (claimsUpdate.error)
      return error(claimsUpdate.error, "Failed to update claims");

    await redis.del(getPermissionCacheKey(id));

    return success("Permissions updated");
  } else {
    return error(null, "You do not have permission to update permissions");
  }
}
