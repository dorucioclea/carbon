import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { arrayToTree } from "performant-array-to-tree";
import { GroupsTable, GroupsTableFilters } from "~/modules/Users/Groups";
import type { Group } from "~/modules/Users/types";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { getGroups } from "~/services/users";
import { getQueryFilters } from "~/utils/http";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const uid = searchParams.get("uid");
  const { limit, offset } = getQueryFilters(searchParams);

  const groups = await getGroups(client, { name, uid, limit, offset });

  if (groups.error) {
    return json(
      { groups: [], count: 0, error: groups.error },
      await flash(request, error(groups.error, "Failed to load groups"))
    );
  }

  return json({
    groups: arrayToTree(groups.data) as Group[],
    error: null,
    count: groups.count,
  });
}

export default function GroupsRoute() {
  const { groups, count } = useLoaderData<typeof loader>();

  return (
    <>
      <GroupsTableFilters />
      <GroupsTable data={groups ?? []} count={count ?? 0} />
      <Outlet />
    </>
  );
}
