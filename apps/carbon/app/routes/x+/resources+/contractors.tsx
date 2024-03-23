import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  ContractorsTable,
  getAbilitiesList,
  getContractors,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Contractors",
  to: path.to.contractors,
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

  const [contractors, abilities] = await Promise.all([
    getContractors(client, {
      search,
      limit,
      offset,
      sorts,
      filters,
    }),
    getAbilitiesList(client),
  ]);

  if (contractors.error) {
    return redirect(
      path.to.resources,
      await flash(
        request,
        error(contractors.error, "Failed to load contractors")
      )
    );
  }

  return json({
    contractors: contractors.data ?? [],
    abilities: abilities.data ?? [],
    count: contractors.count ?? 0,
  });
}

export default function Route() {
  const { contractors, abilities, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <ContractorsTable
        data={contractors}
        count={count}
        abilities={abilities}
      />
      <Outlet />
    </VStack>
  );
}
