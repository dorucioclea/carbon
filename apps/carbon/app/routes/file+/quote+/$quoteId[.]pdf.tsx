import { PurchaseOrderPDF } from "@carbon/documents";
import { renderToStream } from "@react-pdf/renderer";
import { type LoaderFunctionArgs } from "@remix-run/node";
import logger from "~/lib/logger";
// import {
//   getPurchaseOrder,
//   getPurchaseOrderLines,
//   getPurchaseOrderLocations,
// } from "~/modules/purchasing";
import { getQuote } from "~/modules/sales";
import { getCompany } from "~/modules/settings";
import { requirePermissions } from "~/services/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "purchasing",
  });

  const { quoteId } = params;
  if (!quoteId) throw new Error("Could not find quoteId");

  const [company, quote] = await Promise.all([
    getCompany(client),
    getQuote(client, quoteId),
  ]);

  if (company.error) {
    logger.error(company.error);
  }

  if (quote.error) {
    logger.error(quote.error);
  }

  //   if (purchaseOrderLines.error) {
  //     logger.error(purchaseOrderLines.error);
  //   }

  //   if (purchaseOrderLocations.error) {
  //     logger.error(purchaseOrderLocations.error);
  //   }

  //   if (
  //     company.error ||
  //     purchaseOrder.error ||
  //     purchaseOrderLines.error ||
  //     purchaseOrderLocations.error
  //   ) {
  //     throw new Error("Failed to load purchase order");
  //   }

  const stream = await renderToStream(
    <PurchaseOrderPDF
      company={company.data}
      quote={quote.data}
      //   purchaseOrder={purchaseOrder.data}
      //   purchaseOrderLines={purchaseOrderLines.data ?? []}
      //   purchaseOrderLocations={purchaseOrderLocations.data}
    />
  );

  const body: Buffer = await new Promise((resolve, reject) => {
    const buffers: Uint8Array[] = [];
    stream.on("data", (data) => {
      buffers.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on("error", reject);
  });

  const headers = new Headers({ "Content-Type": "application/pdf" });
  return new Response(body, { status: 200, headers });
}
