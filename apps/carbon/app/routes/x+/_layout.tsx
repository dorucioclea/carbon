import { Toaster, TooltipProvider } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
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
  requireAuthSession,
} from "~/services/session.server";
import { path } from "~/utils/path";

import type { ShouldRevalidateFunction } from "@remix-run/react";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  defaultShouldRevalidate,
}) => {
  if (
    currentUrl.pathname.startsWith("/x/settings") ||
    currentUrl.pathname.startsWith("/x/users")
  ) {
    return true;
  }

  return defaultShouldRevalidate;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { accessToken, companyId, expiresAt, expiresIn, userId } =
    await requireAuthSession(request, { verify: true });

  // share a client between requests
  const client = getSupabase(accessToken);

  // parallelize the requests
  const [company, customFields, integrations, user, claims, groups, defaults] =
    await Promise.all([
      getCompany(client, companyId),
      getCustomFieldsSchemas(client, { companyId }),
      getIntegrations(client, companyId),
      getUser(client, userId),
      getUserClaims(request),
      getUserGroups(client, userId),
      getUserDefaults(client, userId, companyId),
    ]);

  if (!claims || user.error || !user.data || !groups.data) {
    await destroyAuthSession(request);
  }

  const requiresOnboarding = !company.data?.name;
  if (requiresOnboarding) {
    throw redirect(path.to.onboarding.root);
  }

  return json({
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
  });
}

export default function AuthenticatedRoute() {
  const { session } = useLoaderData<typeof loader>();

  const transition = useNavigation();

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
        <TooltipProvider>
          <div className="min-h-full flex flex-col">
            <div className="flex-none" />
            <div className="h-screen min-h-[0px] basis-0 flex-1">
              <div className="flex h-full">
                <IconSidebar />
                <div className="flex w-full h-full">
                  <div className="w-full h-full flex-1 overflow-hidden">
                    <main className="h-full flex flex-col flex-1 w-full overflow-x-hidden bg-muted">
                      <Topbar />
                      <main className="flex-1 overflow-y-auto max-h-[calc(100vh-49px)]">
                        <Outlet />
                      </main>
                    </main>
                  </div>
                </div>
              </div>
            </div>
            <Toaster position="bottom-right" />
          </div>
        </TooltipProvider>
      </RealtimeDataProvider>
    </SupabaseProvider>
  );
}
