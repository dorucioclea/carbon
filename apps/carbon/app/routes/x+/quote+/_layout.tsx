import { VStack } from "@carbon/react";
import { Outlet } from "@remix-run/react";
import type { MetaFunction } from "@vercel/remix";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Quotation" }];
};

export const handle: Handle = {
  breadcrumb: "Sales",
  to: path.to.sales,
  module: "sales",
};

export default function QuotationRoute() {
  return (
    <VStack spacing={4} className="h-full">
      <Outlet />
    </VStack>
  );
}
