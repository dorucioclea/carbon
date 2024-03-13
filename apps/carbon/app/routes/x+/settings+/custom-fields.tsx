import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getAttributeDataTypes } from "~/modules/resources";
import {
  CustomFieldsTable,
  CustomFieldsTableFilters,
  getCustomFieldsTables,
} from "~/modules/settings";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Custom Fields",
  to: path.to.customFields,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "settings",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  const [tables, dataTypes] = await Promise.all([
    getCustomFieldsTables(client, { name, limit, offset, sorts }),
    getAttributeDataTypes(client),
  ]);

  if (tables.error) {
    redirect(
      path.to.authenticatedRoot,
      await flash(request, error(tables.error, "Failed to fetch custom fields"))
    );
  }

  return json({
    count: tables.count ?? 0,
    tables: tables.data ?? [],
    dataTypes: dataTypes.data ?? [],
  });
}

export default function UserAttributesRoute() {
  const { count, tables } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <CustomFieldsTableFilters />
      <CustomFieldsTable data={tables} count={count} />
      <Outlet />
    </VStack>
  );
}
