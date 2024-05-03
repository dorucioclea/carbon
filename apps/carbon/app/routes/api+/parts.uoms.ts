import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUnitOfMeasuresList } from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {});

  return json(await getUnitOfMeasuresList(authorized.client));
}
