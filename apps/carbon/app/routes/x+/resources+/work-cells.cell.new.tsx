import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { upsertWorkCell, workCellValidator } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "resources",
  });

  const formData = await request.formData();
  const validation = await validator(workCellValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const insertWorkCell = await upsertWorkCell(client, {
    ...data,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });
  if (insertWorkCell.error) {
    return json(
      {},
      await flash(
        request,
        error(insertWorkCell.error, "Failed to create work cell")
      )
    );
  }

  return redirect(path.to.workCells);
}
