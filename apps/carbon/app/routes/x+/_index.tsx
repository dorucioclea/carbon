import { Card, CardHeader, VStack } from "@carbon/react";
import { Link } from "@remix-run/react";
import { useModules } from "~/components/Layout/Navigation/useModules";
import { useUser } from "~/hooks";

export default function AppIndexRoute() {
  const user = useUser();
  const name = `${user.firstName} ${user.lastName}`;

  const modules = useModules();
  const date = new Date();

  return (
    <VStack className="p-4 gap-4">
      <div>
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Hello, {name}
        </h3>
        <p className="text-sm text-muted-foreground">{date.toDateString()}</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {modules.map((module) => (
          <Card className="w-48" key={module.name}>
            <Link to={module.to}>
              <CardHeader className="text-xl flex flex-row items-center">
                <module.icon className="flex rounded-md items-center mr-2 justify-center" />
                {module.name}
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </VStack>
  );
}
