import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { ShiftsTable, getLocations, getShifts } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Shifts",
  to: path.to.shifts,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [shifts, locations] = await Promise.all([
    getShifts(client, { search, limit, offset, sorts, filters }),
    getLocations(client),
  ]);

  if (shifts.error) {
    throw redirect(
      path.to.resources,
      await flash(request, error(shifts.error, "Failed to load shifts"))
    );
  }

  return json({
    shifts: shifts.data ?? [],
    locations: locations.data ?? [],
    count: shifts.count ?? 0,
  });
}

export default function ShiftsRoute() {
  const { shifts, locations, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <ShiftsTable data={shifts} count={count} locations={locations} />
      <Outlet />
    </VStack>
  );
}
