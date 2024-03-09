import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { departmentValidator, upsertDepartment } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "resources",
  });

  const validation = await validator(departmentValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createDepartment = await upsertDepartment(client, {
    ...data,
    createdBy: userId,
  });

  if (createDepartment.error) {
    return json(
      createDepartment,
      await flash(
        request,
        error(createDepartment.error, "Failed to insert department")
      )
    );
  }

  const departmentId = createDepartment.data?.id;
  if (!departmentId) throw new Error("Department ID not found");

  return json(createDepartment, { status: 201 });
}
