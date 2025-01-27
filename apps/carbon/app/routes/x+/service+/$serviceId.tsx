import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { ServiceHeader, ServiceSidebar, getService } from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Services",
  to: path.to.services,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
  });

  const { serviceId } = params;
  if (!serviceId) throw new Error("Could not find serviceId");

  const [service] = await Promise.all([
    getService(client, serviceId, companyId),
  ]);

  if (service.error) {
    throw redirect(
      path.to.parts,
      await flash(request, error(service.error, "Failed to load service"))
    );
  }

  return json({
    service: service.data,
  });
}

export default function ServiceRoute() {
  return (
    <>
      <ServiceHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <ServiceSidebar />
        <Outlet />
      </div>
    </>
  );
}
