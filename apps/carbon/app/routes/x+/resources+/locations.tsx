import { VStack } from "@carbon/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  LocationsTable,
  LocationsTableFilters,
  getLocations,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Locations",
  to: path.to.locations,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  const locations = await getLocations(client, { name, limit, offset, sorts });

  if (locations.error) {
    return redirect(
      path.to.resources,
      await flash(request, error(locations.error, "Failed to load locations"))
    );
  }

  return json({
    locations: locations.data ?? [],
    count: locations.count ?? 0,
  });
}

export default function LocationsRoute() {
  const { locations, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <LocationsTableFilters />
      <LocationsTable data={locations} count={count} />
      <Outlet />
    </VStack>
  );
}
