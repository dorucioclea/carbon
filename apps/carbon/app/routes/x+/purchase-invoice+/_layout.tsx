import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getPaymentTermsList } from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Invoicing" }];
};

export const handle: Handle = {
  breadcrumb: "Invoicing",
  to: path.to.purchaseInvoices,
  module: "invoicing",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "invoicing",
  });
  const [paymentTerms] = await Promise.all([getPaymentTermsList(client)]);

  return {
    paymentTerms: paymentTerms.data ?? [],
  };
}

export default function PurchaseInvoiceRoute() {
  return (
    <VStack spacing={4} className="h-full p-4">
      <Outlet />
    </VStack>
  );
}
