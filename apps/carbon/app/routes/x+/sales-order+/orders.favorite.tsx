import { validationError, validator } from "@carbon/remix-validated-form";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { updateSalesOrderFavorite } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { favoriteSchema } from "~/types/validators";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  const { client, userId } = await requirePermissions(request, {
    view: "sales",
  });

  const validation = await validator(favoriteSchema).validate(
    await request.formData()
  );
  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, favorite } = validation.data;

  const result = await updateSalesOrderFavorite(client, {
    id,
    favorite: favorite === "favorite",
    userId,
  });

  if (result.error) {
    return json(
      {},
      await flash(request, error(result, "Failed to favorite sales order"))
    );
  }

  return json({});
}
