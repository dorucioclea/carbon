import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  PartnersTable,
  getAbilitiesList,
  getPartners,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Partners",
  to: path.to.partners,
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

  const [partners, abilities] = await Promise.all([
    getPartners(client, companyId, {
      search,
      limit,
      offset,
      sorts,
      filters,
    }),
    getAbilitiesList(client, companyId),
  ]);

  if (partners.error) {
    throw redirect(
      path.to.resources,
      await flash(request, error(partners.error, "Failed to load partners"))
    );
  }

  return json({
    partners: partners.data ?? [],
    abilities: abilities.data ?? [],
    count: partners.count ?? 0,
  });
}

export default function Route() {
  const { partners, abilities, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <PartnersTable data={partners} count={count} abilities={abilities} />
      <Outlet />
    </VStack>
  );
}
