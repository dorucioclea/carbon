import { Heading } from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Link } from "@remix-run/react";
import { useModules } from "~/components/Layout/Navigation/useModules";
import { useUser } from "~/hooks";

export default function AppIndexRoute() {
  const user = useUser();
  const modules = useModules();
  return (
    <div className="p-8 w-full">
      <Heading size="h3">Hello, {user.firstName}</Heading>
      <p className="text-muted-foreground text-base font-light">
        {formatDate(today(getLocalTimeZone()).toString(), {
          dateStyle: "full",
        })}
      </p>
      <hr className="h-px my-8 bg-black/10 border-0 dark:bg-white/10" />
      <p className="text-muted-foreground text-base font-light mb-8">Modules</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {modules.map((module) => (
          <Link
            key={module.name}
            to={module.to}
            prefetch="intent"
            className="flex flex-col gap-6 items-center justify-center py-8 bg-gradient-to-bl from-card to-background rounded-lg shadow text-center group ring-2 ring-transparent hover:ring-white/10 cursor-pointer"
          >
            <module.icon className="text-3xl" />
            <span className="text-sm py-1 px-4 border border-border rounded-full group-hover:bg-accent">
              {module.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
