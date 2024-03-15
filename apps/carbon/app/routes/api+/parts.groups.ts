import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getPartGroupsList } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {});

  return json(await getPartGroupsList(authorized.client));
}
