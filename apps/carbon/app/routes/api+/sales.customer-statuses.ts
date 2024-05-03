import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getCustomerStatusesList } from "~/modules/sales";
import { requirePermissions } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {
    view: "sales",
  });

  return json(await getCustomerStatusesList(authorized.client));
}
