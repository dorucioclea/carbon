import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  CustomerStatusesTable,
  CustomerStatusesTableFilters,
  getCustomerStatuses,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";

export const handle: Handle = {
  breadcrumb: "Customer Statuses",
  to: path.to.customerStatuses,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  return json(
    await getCustomerStatuses(client, { name, limit, offset, sorts })
  );
}

export default function CustomerStatusesRoute() {
  const { data, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <CustomerStatusesTableFilters />
      <CustomerStatusesTable data={data ?? []} count={count ?? 0} />
      <Outlet />
    </VStack>
  );
}
