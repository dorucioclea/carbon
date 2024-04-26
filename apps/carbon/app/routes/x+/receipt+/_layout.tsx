import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUnitOfMeasuresList } from "~/modules/parts";
import { getLocationsList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Receipt" }];
};

export const handle: Handle = {
  breadcrumb: "Inventory",
  to: path.to.receipts,
  module: "inventory",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "inventory",
  });

  const [unitOfMeasures, locations] = await Promise.all([
    getUnitOfMeasuresList(client),
    getLocationsList(client, companyId),
  ]);

  return {
    locations: locations?.data ?? [],
    unitOfMeasures: unitOfMeasures?.data ?? [],
  };
}

export default function ReceiptRoute() {
  return (
    <VStack spacing={4} className="h-full p-4">
      <Outlet />
    </VStack>
  );
}
