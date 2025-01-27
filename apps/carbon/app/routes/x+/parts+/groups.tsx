import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getAccountsList } from "~/modules/accounting";
import { PartGroupsTable, getPartGroups } from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Part Groups",
  to: path.to.partGroups,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [partGroups, accounts] = await Promise.all([
    getPartGroups(client, companyId, {
      limit,
      offset,
      sorts,
      search,
      filters,
    }),
    getAccountsList(client, companyId),
  ]);

  if (partGroups.error) {
    throw redirect(
      path.to.parts,
      await flash(request, error(null, "Error loading part groups"))
    );
  }

  if (accounts.error) {
    throw redirect(
      path.to.partGroups,
      await flash(request, error(accounts.error, "Error loading accounts"))
    );
  }

  return json({
    partGroups: partGroups.data ?? [],
    count: partGroups.count ?? 0,
    accounts: accounts.data ?? [],
  });
}

export default function PartGroupsRoute() {
  const { partGroups, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <PartGroupsTable data={partGroups} count={count ?? 0} />
      <Outlet />
    </VStack>
  );
}
