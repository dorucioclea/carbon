import { Button, HStack, useWindowSize } from "@carbon/react";
import { Link, useMatches } from "@remix-run/react";
import { BsFillHexagonFill } from "react-icons/bs";
import { z } from "zod";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs as BreadcrumbsBase,
} from "~/components";
import { useRouteData } from "~/hooks";
import type { Company } from "~/modules/settings";
import { path } from "~/utils/path";

export const BreadcrumbHandle = z.object({
  breadcrumb: z.any(),
  to: z.string().optional(),
});
export type BreadcrumbHandleType = z.infer<typeof BreadcrumbHandle>;

const BreadcrumbHandleMatch = z.object({
  handle: BreadcrumbHandle,
});

const Breadcrumbs = () => {
  const routeData = useRouteData<{ company: Company }>(
    path.to.authenticatedRoot
  );
  const matches = useMatches();

  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m);
      if (!result.success || !result.data.handle.breadcrumb) return null;

      return {
        breadcrumb: result.data.handle.breadcrumb,
        to: result.data.handle?.to ?? m.pathname,
      };
    })
    .filter(Boolean);

  const { width } = useWindowSize();

  return (
    <HStack className="items-center h-full -ml-2" spacing={0}>
      <BreadcrumbsBase className="line-clamp-1">
        {width && width <= 640 ? (
          <BreadcrumbItem>
            <Button isIcon asChild variant="ghost">
              <Link to="/">
                <BsFillHexagonFill />
              </Link>
            </Button>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink to="/">{routeData?.company.name}</BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {breadcrumbs.map((breadcrumb, i) => (
          <BreadcrumbItem key={i}>
            <BreadcrumbLink
              isCurrentPage={!breadcrumb?.to}
              to={breadcrumb?.to ?? ""}
            >
              {breadcrumb?.breadcrumb}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </BreadcrumbsBase>
    </HStack>
  );
};

export default Breadcrumbs;
