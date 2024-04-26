import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getLocationsList } from "~/modules/resources";
import {
  SalesOrderHeader,
  SalesOrderSidebar,
  getSalesOrder,
  //getSalesOrderExternalDocuments,
  //getSalesOrderInternalDocuments,
  getSalesOrderLines,
  useSalesOrderTotals,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Orders",
  to: path.to.salesOrders,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "sales",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const [
    salesOrder,
    salesOrderLines,
    //externalDocuments,
    //internalDocuments,
    locations,
  ] = await Promise.all([
    getSalesOrder(client, orderId),
    getSalesOrderLines(client, orderId),
    //getSalesOrderExternalDocuments(client, companyId, orderId),
    //getSalesOrderInternalDocuments(client, companyId, orderId),
    getLocationsList(client, companyId),
  ]);

  if (salesOrder.error) {
    throw redirect(
      path.to.salesOrders,
      await flash(
        request,
        error(salesOrder.error, "Failed to load sales order summary")
      )
    );
  }

  return json({
    salesOrder: salesOrder.data,
    salesOrderLines: salesOrderLines.data ?? [],
    //externalDocuments: externalDocuments.data ?? [],
    //internalDocuments: internalDocuments.data ?? [],
    locations: locations.data ?? [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  throw redirect(request.headers.get("Referer") ?? request.url);
}

export default function SalesOrderRoute() {
  const { salesOrderLines } = useLoaderData<typeof loader>();
  const [, setSalesOrderTotals] = useSalesOrderTotals();

  useEffect(() => {
    const totals = salesOrderLines.reduce(
      (acc, line) => {
        acc.total += (line.saleQuantity ?? 0) * (line.unitPrice ?? 0);

        return acc;
      },
      { total: 0 }
    );
    setSalesOrderTotals(totals);
  }, [salesOrderLines, setSalesOrderTotals]);

  return (
    <>
      <SalesOrderHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <SalesOrderSidebar />
        <Outlet />
      </div>
    </>
  );
}
