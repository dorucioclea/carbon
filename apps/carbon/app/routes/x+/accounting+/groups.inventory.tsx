import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import type { AccountListItem } from "~/modules/accounting";
import {
  InventoryPostingGroupsTable,
  getInventoryPostingGroups,
} from "~/modules/accounting";
import { getPartGroupsList } from "~/modules/parts";
import { getLocationsList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Inventory Groups",
  to: path.to.accountingGroupsInventory,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: ["accounting", "inventory"],
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [inventoryGroups, partGroups, locations] = await Promise.all([
    getInventoryPostingGroups(client, {
      limit,
      offset,
      sorts,
      filters,
    }),
    getPartGroupsList(client),
    getLocationsList(client),
  ]);
  if (inventoryGroups.error) {
    throw redirect(
      path.to.accounting,
      await flash(
        request,
        error(inventoryGroups.error, "Failed to fetch inventory posting groups")
      )
    );
  }

  return json({
    data: inventoryGroups.data ?? [],
    partGroups: partGroups.data ?? [],
    locations: locations.data ?? [],
    count: inventoryGroups.count ?? 0,
  });
}

export default function InventoryPostingGroupsRoute() {
  const { data, partGroups, locations, count } = useLoaderData<typeof loader>();

  const routeData = useRouteData<{
    balanceSheetAccounts: AccountListItem[];
    incomeStatementAccounts: AccountListItem[];
  }>(path.to.accounting);

  return (
    <VStack spacing={0} className="h-full">
      <InventoryPostingGroupsTable
        data={data}
        count={count}
        partGroups={partGroups}
        locations={locations}
        balanceSheetAccounts={routeData?.balanceSheetAccounts ?? []}
        incomeStatementAccounts={routeData?.incomeStatementAccounts ?? []}
      />
      <Outlet />
    </VStack>
  );
}
