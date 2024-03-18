import { VStack } from "@carbon/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  ContractorsTable,
  ContractorsTableFilters,
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
  const name = searchParams.get("name");
  const ability = searchParams.get("ability");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  const [contractors, abilities] = await Promise.all([
    getContractors(client, {
      name,
      limit,
      offset,
      sorts,
      ability,
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
      <ContractorsTableFilters abilities={abilities} />
      <ContractorsTable data={contractors} count={count} />
      <Outlet />
    </VStack>
  );
}
