import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { CreateEmployeeModal, createEmployeeValidator } from "~/modules/users";
import { createEmployeeAccount } from "~/modules/users/users.server";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client } = await requirePermissions(request, {
    create: "users",
  });

  const validation = await validator(createEmployeeValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { email, firstName, lastName, employeeType } = validation.data;
  const result = await createEmployeeAccount(client, {
    email,
    firstName,
    lastName,
    employeeType,
  });

  throw redirect(path.to.employeeAccounts, await flash(request, result));
}

export default function () {
  return <CreateEmployeeModal />;
}
