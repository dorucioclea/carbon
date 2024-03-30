import { Button, VStack, cn, useDisclosure } from "@carbon/react";
import { Link, useMatches } from "@remix-run/react";
import { noop } from "@tanstack/react-table";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { BsFillHexagonFill } from "react-icons/bs";
import { z } from "zod";
import { useOptimisticLocation } from "~/hooks";
import type { Authenticated, NavItem } from "~/types";
import { useModules } from "./useModules";

export const ModuleHandle = z.object({
  module: z.string(),
});

const IconSidebar = () => {
  const navigationPanel = useDisclosure();
  const location = useOptimisticLocation();
  const currentModule = getModule(location.pathname);
  const links = useModules();
  const matchedModules = useMatches().reduce((acc, match) => {
    if (match.handle) {
      const result = ModuleHandle.safeParse(match.handle);
      if (result.success) {
        acc.add(result.data.module);
      }
    }

    return acc;
  }, new Set<string>());

  return (
    <div className="w-14 h-full flex flex-col z-50">
      <nav
        data-state={navigationPanel.isOpen ? "expanded" : "collapsed"}
        className={cn(
          "bg-background group py-2 z-10 h-full w-14 data-[state=expanded]:w-[13rem]",
          "border-r border-border data-[state=expanded]:shadow-xl",
          "transition-width duration-200",
          "hide-scrollbar flex flex-col justify-between overflow-y-auto"
        )}
        onMouseEnter={navigationPanel.onOpen}
        onMouseLeave={navigationPanel.onClose}
      >
        <VStack spacing={1} className="flex flex-col justify-start px-2">
          <Button isIcon asChild variant="ghost" size="lg">
            <Link to="/">
              <BsFillHexagonFill />
            </Link>
          </Button>

          {links.map((link) => {
            const m = getModule(link.to);
            const moduleMatches = matchedModules.has(m);
            const anotherModuleMatches = links.some((l) => {
              const m = getModule(l.to);
              return matchedModules.has(m);
            });

            const isActive =
              currentModule === m || (moduleMatches && !anotherModuleMatches);
            return (
              <NavigationIconLink
                key={link.name}
                link={link}
                isActive={isActive}
                isOpen={navigationPanel.isOpen}
                onClick={navigationPanel.onClose}
              />
            );
          })}
        </VStack>
      </nav>
    </div>
  );
};

interface NavigationIconButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  link: Authenticated<NavItem>;
  isActive?: boolean;
  isOpen?: boolean;
}

const NavigationIconLink = forwardRef<
  HTMLAnchorElement,
  NavigationIconButtonProps
>(
  (
    { link, isActive = false, isOpen = false, onClick = noop, ...props },
    ref
  ) => {
    const iconClasses = [
      "absolute left-3 top-3 flex rounded-md items-center items-center justify-center", // Layout
    ];

    const classes = [
      "relative",
      "h-10 w-10 group-data-[state=expanded]:w-full",
      "transition-all duration-200",
      "flex items-center rounded-md",
      "group-data-[state=collapsed]:justify-center",
      "group-data-[state=expanded]:-space-x-2",
      "hover:bg-secondary active:",
      `${
        isActive
          ? "!bg-primary/10 !text-foreground shadow-sm hover:text-primary-foreground font-semibold"
          : "hover:text-foreground font-light"
      }`,
      "group/item",
    ];

    return (
      <Link
        role="button"
        aria-current={isActive}
        ref={ref}
        to={link.to}
        {...props}
        onClick={onClick}
        className={cn(classes, props.className)}
        prefetch="intent"
      >
        <link.icon className={cn(...iconClasses)} />

        <span
          aria-hidden={isOpen || undefined}
          className={cn(
            "min-w-[128px] text-sm",
            "absolute left-7 group-data-[state=expanded]:left-12",
            "opacity-0 group-data-[state=expanded]:opacity-100"
          )}
        >
          {link.name}
        </span>
      </Link>
    );
  }
);
NavigationIconLink.displayName = "NavigationIconLink";

export default IconSidebar;

function getModule(link: string) {
  return link.split("/")?.[2];
}
