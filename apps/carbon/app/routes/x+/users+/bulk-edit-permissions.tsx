import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { z } from "zod";
import type { permissionsUpdateSchema } from "~/jobs/update-permissions.server";
import { triggerClient } from "~/lib/trigger.server";
import type { Permission } from "~/modules/users";
import {
  bulkPermissionsValidator,
  userPermissionsValidator,
} from "~/modules/users";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  await requirePermissions(request, {
    update: "users",
  });

  const validation = await validator(bulkPermissionsValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { editType, userIds, data } = validation.data;
  const addOnly = editType === "add";
  const permissions: Record<string, Permission> = JSON.parse(data);

  if (
    !Object.values(permissions).every(
      (permission) => userPermissionsValidator.safeParse(permission).success
    )
  ) {
    throw redirect(
      path.to.employeeAccounts,
      await flash(request, error(permissions, "Failed to parse permissions"))
    );
  }

  const jobs = userIds.map<{
    name: string;
    payload: z.infer<typeof permissionsUpdateSchema>;
  }>((id) => ({
    name: `update.permissions`,
    payload: {
      id,
      permissions,
      addOnly,
    },
  }));

  await triggerClient.sendEvents(jobs);

  throw redirect(
    `${path.to.employeeAccounts}?${getParams(request)}`,
    await flash(request, success("Updating user permissions"))
  );
}
