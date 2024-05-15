import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { WorkCellTypesTable, getWorkCellTypes } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Work Cells",
  to: path.to.workCells,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const workCellTypes = await getWorkCellTypes(client, companyId, {
    search,
    limit,
    offset,
    sorts,
    filters,
  });

  if (workCellTypes.error) {
    redirect(
      path.to.resources,
      await flash(
        request,
        error(workCellTypes.error, "Failed to fetch equipment types")
      )
    );
  }

  return json({
    count: workCellTypes.count ?? 0,
    workCellTypes: workCellTypes.data ?? [],
  });
}

export default function UserAttributesRoute() {
  const { count, workCellTypes } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <WorkCellTypesTable data={workCellTypes} count={count} />
      <Outlet />
    </VStack>
  );
}
