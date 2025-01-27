import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { PartHeader, PartSidebar, getPart } from "~/modules/parts";
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

  const [partSummary] = await Promise.all([getPart(client, partId, companyId)]);

  if (partSummary.error) {
    throw redirect(
      path.to.parts,
      await flash(
        request,
        error(partSummary.error, "Failed to load part summary")
      )
    );
  }

  return json({
    partSummary: partSummary.data,
  });
}

export default function PartRoute() {
  return (
    <>
      <PartHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <PartSidebar />
        <Outlet />
      </div>
    </>
  );
}
