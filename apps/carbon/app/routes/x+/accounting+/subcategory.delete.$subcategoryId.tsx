import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteAccountSubcategory } from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "accounting",
  });

  const { subcategoryId } = params;
  if (!subcategoryId) {
    throw redirect(
      `${path.to.accountingCategories}?${getParams(request)}`,
      await flash(
        request,
        error(params, "Failed to get a G/L account subcategory id")
      )
    );
  }

  const deactivateSubcategory = await deleteAccountSubcategory(
    client,
    subcategoryId
  );
  if (deactivateSubcategory.error) {
    throw redirect(
      `${path.to.accountingCategories}?${getParams(request)}`,
      await flash(
        request,
        error(
          deactivateSubcategory.error,
          "Failed to deactivate G/L account subcategory"
        )
      )
    );
  }

  throw redirect(
    `${path.to.accountingCategories}?${getParams(request)}`,
    await flash(
      request,
      success("Successfully deactivated G/L account subcategory")
    )
  );
}
