import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import {
  PurchaseInvoiceHeader,
  PurchaseInvoiceSidebar,
  getPurchaseInvoice,
  getPurchaseInvoiceLines,
  usePurchaseInvoiceTotals,
} from "~/modules/invoicing";
import { getLocationsList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Purchasing",
  to: path.to.purchaseInvoices,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
  });

  const { invoiceId } = params;
  if (!invoiceId) throw new Error("Could not find invoiceId");

  const [purchaseInvoice, purchaseInvoiceLines, locations] = await Promise.all([
    getPurchaseInvoice(client, invoiceId),
    getPurchaseInvoiceLines(client, invoiceId),
    getLocationsList(client, companyId),
  ]);

  if (purchaseInvoice.error) {
    throw redirect(
      path.to.purchaseInvoices,
      await flash(
        request,
        error(purchaseInvoice.error, "Failed to load purchase invoice")
      )
    );
  }

  return json({
    locations: locations.data ?? [],
    purchaseInvoice: purchaseInvoice.data,
    purchaseInvoiceLines: purchaseInvoiceLines.data ?? [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  throw redirect(request.headers.get("Referer") ?? request.url);
}

export default function PurchaseInvoiceRoute() {
  const { purchaseInvoiceLines } = useLoaderData<typeof loader>();
  const [, setPurchaseInvoiceTotals] = usePurchaseInvoiceTotals();

  useEffect(() => {
    const totals = purchaseInvoiceLines.reduce(
      (acc, line) => {
        acc.total += line?.totalAmount ?? 0;

        return acc;
      },
      { total: 0 }
    );
    setPurchaseInvoiceTotals(totals);
  }, [purchaseInvoiceLines, setPurchaseInvoiceTotals]);
  return (
    <>
      <PurchaseInvoiceHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <PurchaseInvoiceSidebar />
        <Outlet />
      </div>
    </>
  );
}
