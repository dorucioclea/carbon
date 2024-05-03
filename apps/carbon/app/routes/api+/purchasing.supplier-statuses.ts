import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSupplierStatusesList } from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {
    view: "purchasing",
  });

  return json(await getSupplierStatusesList(authorized.client));
}
