import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { insertQuoteLineQuantity } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "sales",
  });

  const { id: quoteId, lineId: quoteLineId } = params;
  if (!quoteId) throw new Error("Could not find quoteId");
  if (!quoteLineId) throw new Error("Could not find quoteLineId");

  const createQuoteQuantity = await insertQuoteLineQuantity(client, {
    quoteId,
    quoteLineId: quoteLineId,
    createdBy: userId,
  });

  if (createQuoteQuantity.error) {
    return redirect(
      path.to.quoteLine(quoteId, quoteLineId),
      await flash(
        request,
        error(
          createQuoteQuantity.error,
          "Failed to create quote line quantity."
        )
      )
    );
  }

  return redirect(path.to.quoteLine(quoteId, quoteLineId));
}
