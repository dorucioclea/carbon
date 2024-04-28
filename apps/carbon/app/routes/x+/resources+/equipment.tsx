import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { EquipmentTypesTable, getEquipmentTypes } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Equipment",
  to: path.to.equipment,
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

  const equipmentTypes = await getEquipmentTypes(client, {
    search,
    limit,
    offset,
    sorts,
    filters,
  });

  if (equipmentTypes.error) {
    redirect(
      path.to.resources,
      await flash(
        request,
        error(equipmentTypes.error, "Failed to fetch equipment types")
      )
    );
  }

  return json({
    count: equipmentTypes.count ?? 0,
    equipmentTypes: equipmentTypes.data ?? [],
  });
}

export default function UserAttributesRoute() {
  const { count, equipmentTypes } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <EquipmentTypesTable data={equipmentTypes} count={count} />
      <Outlet />
    </VStack>
  );
}
