import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { getWorkCellTypesList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {});

  return json(await getWorkCellTypesList(authorized.client));
}
