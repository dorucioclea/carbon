import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { ReceiptsTable } from "~/modules/inventory";
import { requirePermissions } from "~/services/auth";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";

export const handle: Handle = {
  breadcrumb: "Receipts",
  to: path.to.receipts,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "inventory",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  // const [receipts, locations] = await Promise.all([
  //   getReceipts(client, {
  //     search,
  //     limit,
  //     offset,
  //     sorts,
  //     filters,
  //   }),
  //   getLocationsList(client),
  // ]);

  // if (receipts.error) {
  //   return redirect(
  //     path.to.inventory,
  //     await flash(request, error(null, "Error loading receipts"))
  //   );
  // }

  // return json({
  //   receipts: receipts.data ?? [],
  //   count: receipts.count ?? 0,
  //   locations: locations.data ?? [],
  // });

  return json({
    receipts: [],
    count: 0,
    locations: [],
  });
}

export default function ReceiptsRoute() {
  const { receipts, count, locations } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <ReceiptsTable data={receipts} count={count ?? 0} locations={locations} />
      <Outlet />
    </VStack>
  );
}
