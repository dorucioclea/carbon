import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { QuotationsTable, getQuotes } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Quotes",
  to: path.to.quotes,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [quotes] = await Promise.all([
    getQuotes(client, {
      search,
      limit,
      offset,
      sorts,
      filters,
    }),
  ]);

  if (quotes.error) {
    redirect(
      path.to.authenticatedRoot,
      await flash(request, error(quotes.error, "Failed to fetch quotes"))
    );
  }

  return json({
    count: quotes.count ?? 0,
    quotes: quotes.data ?? [],
  });
}

export default function QuotesRoute() {
  const { count, quotes } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <QuotationsTable data={quotes} count={count} />
      <Outlet />
    </VStack>
  );
}
