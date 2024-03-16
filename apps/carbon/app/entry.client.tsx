import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import posthog from "posthog-js";
import { POSTHOG_API_HOST, POSTHOG_PROJECT_PUBLIC_KEY } from "~/config/env";

function PosthogInit() {
  useEffect(() => {
    posthog.init(POSTHOG_PROJECT_PUBLIC_KEY, {
      api_host: POSTHOG_API_HOST,
      autocapture: false,
      capture_pageview: false,
    });
  }, []);
  return null;
}

//hydrateRoot(
//document,
// <OperatingSystemContextProvider
//   platform={window.navigator.userAgent.includes("Mac") ? "mac" : "windows"}
// >
//   <LocaleContextProvider locales={window.navigator.languages as string[]}>
//<RemixBrowser />
//   </LocaleContextProvider>
// </OperatingSystemContextProvider>
//);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
      <PosthogInit />
    </StrictMode>
  );
});
