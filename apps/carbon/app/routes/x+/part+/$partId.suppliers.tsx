import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { PartSuppliers, getPartSuppliers } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const [partSuppliers] = await Promise.all([getPartSuppliers(client, partId)]);

  if (partSuppliers.error) {
    return redirect(
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
