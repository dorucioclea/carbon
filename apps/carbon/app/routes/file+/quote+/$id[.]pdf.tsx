import { QuotePDF } from "@carbon/documents";
import { renderToStream } from "@react-pdf/renderer";
import { type LoaderFunctionArgs } from "@remix-run/node";
import logger from "~/lib/logger";
import {
  getQuote,
  getQuoteLineQuantitiesByQuoteId,
  getQuoteLines,
  getQuoteCustomerDetails,
} from "~/modules/sales";
import { getCompany } from "~/modules/settings";
import { requirePermissions } from "~/services/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  const [
    company,
    quote,
    quoteLines,
    quoteLineQuantitiesByQuoteId,
    quoteLocations,
  ] = await Promise.all([
    getCompany(client),
    getQuote(client, id),
    getQuoteLines(client, id),
    getQuoteLineQuantitiesByQuoteId(client, id),
    getQuoteCustomerDetails(client, id),
  ]);

  if (company.error) {
    logger.error(company.error);
  }

  if (quote.error) {
    logger.error(quote.error);
  }

  if (quoteLines.error) {
    logger.error(quoteLines.error);
  }

  if (quoteLineQuantitiesByQuoteId.error) {
    logger.error(quoteLineQuantitiesByQuoteId.error);
  }

  if (quoteLocations.error) {
    logger.error(quoteLocations.error);
  }

  if (
    company.error ||
    quote.error ||
    quoteLocations.error ||
    quoteLines.error
  ) {
    throw new Error("Failed to load quote");
  }

  const stream = await renderToStream(
    <QuotePDF
      company={company.data}
      quote={quote.data}
      quoteLines={quoteLines.data}
      quoteLineQuantities={quoteLineQuantitiesByQuoteId.data}
      quoteCustomerDetails={quoteLocations.data}
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
