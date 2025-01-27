import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PartSuppliers, getPartSuppliers } from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const [partSuppliers] = await Promise.all([
    getPartSuppliers(client, partId, companyId),
  ]);

  if (partSuppliers.error) {
    throw redirect(
      path.to.part(partId),
      await flash(
        request,
        error(partSuppliers.error, "Failed to load part suppliers")
      )
    );
  }

  return json({
    partSuppliers: partSuppliers.data ?? [],
  });
}

export default function PartSuppliersRoute() {
  const { partSuppliers } = useLoaderData<typeof loader>();

  return <PartSuppliers partSuppliers={partSuppliers} />;
}
