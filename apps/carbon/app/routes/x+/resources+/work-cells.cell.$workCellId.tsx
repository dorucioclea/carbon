import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { upsertWorkCell, workCellValidator } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "resources",
  });

  const formData = await request.formData();
  const validation = await validator(workCellValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { workCellId } = params;
  if (!workCellId) {
    return redirect(
      path.to.workCells,
      await flash(
        request,
        error("No work cell id provided", "Failed to update work cell")
      )
    );
  }

  const { id, ...data } = validation.data;

  const updateWorkCell = await upsertWorkCell(client, {
    id: workCellId,
    ...data,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updateWorkCell.error)
    redirect(
      path.to.workCells,
      await flash(
        request,
        error(updateWorkCell.error, "Failed to update work cell")
      )
    );

  return redirect(
    path.to.workCellTypeList(validation.data.workCellTypeId),
    await flash(request, success("Successfully updated workCell"))
  );
}
