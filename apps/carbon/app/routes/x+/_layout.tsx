import { Toaster, VStack, toast } from "@carbon/react";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import NProgress from "nprogress";
import { useEffect } from "react";
import { IconSidebar, Topbar } from "~/components/Layout";
import { SupabaseProvider, getSupabase } from "~/lib/supabase";
import { getCompany, getIntegrations } from "~/modules/settings";
import { RealtimeDataProvider } from "~/modules/shared";
import { getCustomFieldsSchemas } from "~/modules/shared/shared.server";
import {
  getUser,
  getUserClaims,
  getUserDefaults,
  getUserGroups,
} from "~/modules/users/users.server";
import {
  destroyAuthSession,
  getSessionFlash,
  requireAuthSession,
} from "~/services/session.server";
import { path } from "~/utils/path";

export function links() {
  return [{ rel: "stylesheet", href: "/assets/theme.css" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { accessToken, expiresAt, expiresIn, userId } =
    await requireAuthSession(request, { verify: true });

  // share a client between requests
  const client = getSupabase(accessToken);

  // parallelize the requests
  const [
    sessionFlash,
    company,
    customFields,
    integrations,
    user,
    claims,
    groups,
    defaults,
  ] = await Promise.all([
    getSessionFlash(request),
    getCompany(client),
    getCustomFieldsSchemas(client, {}),
    getIntegrations(client),
    getUser(client, userId),
    getUserClaims(request),
    getUserGroups(client, userId),
    getUserDefaults(client, userId),
  ]);

  if (!claims || user.error || !user.data || !groups.data) {
    await destroyAuthSession(request);
  }

  const requiresOnboarding = !company.data?.name;
  if (requiresOnboarding) {
    return redirect(path.to.onboarding.root);
  }

  return json(
    {
      session: {
        accessToken,
        expiresIn,
        expiresAt,
      },
      company: company.data,
      customFields: customFields.data ?? [],
      integrations: integrations.data ?? [],
      user: user.data,
      groups: groups.data,
      defaults: defaults.data,
      permissions: claims?.permissions,
      role: claims?.role,
      result: sessionFlash?.result,
    },
    {
      headers: sessionFlash?.headers,
    }
  );
}

export default function AuthenticatedRoute() {
  const { session, result } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  /* Toast Messages */
  useEffect(() => {
    if (result?.success === true) {
      toast.success(result.message);
    } else if (result?.message) {
      toast.error(result.message);
    }
  }, [result]);

  /* NProgress */
  useEffect(() => {
    if (
      (transition.state === "loading" || transition.state === "submitting") &&
      !NProgress.isStarted()
    ) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [transition.state]);

  return (
    <SupabaseProvider session={session}>
      <RealtimeDataProvider>
        <div className="h-screen min-h-[0px] basis-0 flex-1">
          <div className="flex h-full">
            <IconSidebar />
            <div className="w-full h-full">
              <div className="grid grid-rows-[auto_1fr] h-full w-full">
                <Topbar />
                <div className="flex w-full h-full">
                  <VStack spacing={0} className="bg-muted">
                    <Outlet />
                  </VStack>
                </div>
              </div>
            </div>
          </div>
          <Toaster />
        </div>
      </RealtimeDataProvider>
    </SupabaseProvider>
  );
}
