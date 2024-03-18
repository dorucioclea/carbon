import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

import { ProfileForm, getAccount } from "~/modules/account";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
  });

  const { personId } = params;
  if (!personId) throw new Error("Could not find personId");

  const account = await getAccount(client, personId);
  if (account.error) {
    return redirect(
      path.to.people,
      await flash(request, error(account.error, "Failed to load account"))
    );
  }

  return json({
    user: account.data,
  });
}

export default function PersonProfileRoute() {
  const { user } = useLoaderData<typeof loader>();

  return <ProfileForm user={user} />;
}
