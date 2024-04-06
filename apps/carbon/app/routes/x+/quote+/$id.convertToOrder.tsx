import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import {
  getQuote,
  //getQuoteLines,
  convertQuoteToOrder,
  upsertSalesOrder,
} from "~/modules/sales";
import { getNextSequence, rollbackNextSequence } from "~/modules/settings";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action(args: ActionFunctionArgs) {
  const { request, params } = args;
  assertIsPost(request);

  const { client, userId } = await requirePermissions(request, {
    create: "sales",
    role: "employee",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  let newSalesOrderId: string;

  const updateQuoteStatus = await convertQuoteToOrder(client, id, userId);
  if (updateQuoteStatus.error) {
    throw redirect(
      path.to.quote(id),
      await flash(request, error(updateQuoteStatus.error, "Failed to update quote status to Ordered"))
    );
  }

  const quote = await getQuote(client, id);
  if (quote.error) {
    throw redirect(
      path.to.quote(id),
      await flash(request, error(quote.error, "Failed to get quote"))
    );
  }

  try {
    const nextSequence = await getNextSequence(client, "salesOrder", userId);
    if (nextSequence.error) {
      throw redirect(
        path.to.newSalesOrder,
        await flash(
          request,
          error(nextSequence.error, "Failed to get next sequence")
        )
      );
    }
    const createSalesOrder = await upsertSalesOrder(client, {
      salesOrderId: nextSequence.data,
      createdBy: userId,
      quoteId: quote.data.id,
      customerId: quote.data.customerId,
      orderDate: new Date().toISOString(),
    });

    if (createSalesOrder.error || !createSalesOrder.data?.[0]) {
      // TODO: this should be done as a transaction
      await rollbackNextSequence(client, "salesOrder", userId);
      throw redirect(
        path.to.quotes,
        await flash(
          request,
          error(createSalesOrder.error, "Failed to insert sales order")
        )
      );
    }
  
    const order = createSalesOrder.data?.[0];
    newSalesOrderId = order.id;
  } catch (err) {
    throw redirect(
      path.to.quote(id),
      await flash(request, error(err, "Failed to create sales order"))
    );
  }
  throw redirect(
    path.to.salesOrder(newSalesOrderId),
    await flash(request, success("Quote converted to sales order"))
  );
}
