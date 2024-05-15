import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getAccountsList } from "~/modules/accounting";
import { requirePermissions } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {});

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const type = searchParams.get("type");
  const classes = searchParams.getAll("class");

  const incomeBalance = searchParams.get("incomeBalance");
  const result = await getAccountsList(client, companyId, {
    type,
    incomeBalance,
    classes,
  });

  return json(result);
}
