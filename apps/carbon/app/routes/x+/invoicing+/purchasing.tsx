import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  PurchaseInvoicesTable,
  getPurchaseInvoices,
} from "~/modules/invoicing";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Purchasing",
  to: path.to.purchaseInvoices,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "invoicing",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const supplierId = searchParams.get("supplierId");

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [purchaseInvoices] = await Promise.all([
    getPurchaseInvoices(client, companyId, {
      search,
      supplierId,
      limit,
      offset,
      sorts,
      filters,
    }),
  ]);

  if (purchaseInvoices.error) {
    redirect(
      path.to.invoicing,
      await flash(
        request,
        error(purchaseInvoices.error, "Failed to fetch purchase invoices")
      )
    );
  }

  return json({
    count: purchaseInvoices.count ?? 0,
    purchaseInvoices: purchaseInvoices.data ?? [],
  });
}

export default function PurchaseInvoicesSearchRoute() {
  const { count, purchaseInvoices } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <PurchaseInvoicesTable data={purchaseInvoices} count={count} />
      <Outlet />
    </VStack>
  );
}
