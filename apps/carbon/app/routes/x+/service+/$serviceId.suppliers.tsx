import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { ServiceSuppliers, getServiceSuppliers } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { serviceId } = params;
  if (!serviceId) throw new Error("Could not find serviceId");

  const [serviceSuppliers] = await Promise.all([
    getServiceSuppliers(client, serviceId),
  ]);

  if (serviceSuppliers.error) {
    return redirect(
      path.to.service(serviceId),
      await flash(
        request,
        error(serviceSuppliers.error, "Failed to load service suppliers")
      )
    );
  }

  return json({
    serviceSuppliers: serviceSuppliers.data ?? [],
  });
}

export default function ServiceSuppliersRoute() {
  const { serviceSuppliers } = useLoaderData<typeof loader>();

  return <ServiceSuppliers serviceSuppliers={serviceSuppliers} />;
}
