import { json, redirect, useNavigate, useParams } from "@remix-run/react";

import type { ActionFunctionArgs } from "@remix-run/node";
import { ConfirmDelete } from "~/components/Modals";
import { useRouteData } from "~/hooks";
import type { QuotationLineQuantity } from "~/modules/sales";
import { deleteQuoteLineQuantity } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client } = await requirePermissions(request, {
    update: "sales",
  });

  const { id: quoteId, lineId: quoteLineId, quantityId } = params;
  if (!quoteId) throw new Error("Could not find quoteId");
  if (!quoteLineId) throw new Error("Could not find quoteLineId");
  if (!quantityId) throw new Error("Could not find quantityId");

  const deleteLineQuantity = await deleteQuoteLineQuantity(client, quantityId);

  if (deleteLineQuantity.error) {
    return json(
      path.to.quoteLine(quoteId, quoteLineId),
      await flash(
        request,
        error(deleteLineQuantity.error, "Failed to update quote assembly")
      )
    );
  }

  return redirect(path.to.quoteLine(quoteId, quoteLineId));
}

export default function DeleteQuoteLineQuantity() {
  const navigate = useNavigate();

  const { id, lineId, quantityId } = useParams();
  if (!id) throw new Error("id not found");
  if (!lineId) throw new Error("lineId not found");
  if (!quantityId) throw new Error("quantityId not found");

  const routeData = useRouteData<{
    quotationLineQuantities: QuotationLineQuantity[];
  }>(path.to.quoteLine(id, lineId));

  const quoteLineQuantity = routeData?.quotationLineQuantities.find(
    (quantity) => quantity.id === quantityId
  );
  if (!routeData?.quotationLineQuantities || !quoteLineQuantity)
    throw new Error("quote line quantity not found");

  return (
    <ConfirmDelete
      name="Line"
      text={`Are you sure you want to delete this line? This cannot be undone.`}
      onCancel={() => navigate(path.to.quoteLine(id, lineId))}
    />
  );
}
