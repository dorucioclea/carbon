import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getCustomerTypesList } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {
    view: "sales",
  });

  return json(await getCustomerTypesList(authorized.client));
}
