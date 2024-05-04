import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createSalesOrderFromQuote } from "~/modules/sales/sales.server";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path, requestReferrer } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action(args: ActionFunctionArgs) {
  const { request, params } = args;
  assertIsPost(request);

  const { userId } = await requirePermissions(request, {
    create: "sales",
    role: "employee",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find quote id");

  let salesOrderId = "";
  try {
    const result = await createSalesOrderFromQuote(id, userId);
    if (result.error || !result?.data) {
      throw redirect(
        requestReferrer(request) ?? path.to.quote(id),
        await flash(
          request,
          error(result.error, "Failed to create sales order")
        )
      );
    }
    salesOrderId = result.data?.id;
  } catch (err) {
    throw redirect(
      path.to.quote(id),
      await flash(request, error(err, "Failed to create sales order"))
    );
  }
  throw redirect(
    path.to.salesOrder(salesOrderId),
    await flash(request, success("Quote converted to sales order"))
  );
}
