import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { GroupedContentSidebar } from "~/components/Layout";
import logger from "~/lib/logger";
import {
  getAccountsList,
  getBaseCurrency,
  useAccountingSubmodules,
} from "~/modules/accounting";
import { getCustomFieldsSchemas } from "~/modules/shared";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Accounting" }];
};

export const handle: Handle = {
  breadcrumb: "Accounting",
  to: path.to.accounting,
  module: "accounting",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
  });

  // the ABCs of accounting
  const [accounts, baseCurrency, customFields] = await Promise.all([
    getAccountsList(client, {
      type: "Posting",
    }),
    getBaseCurrency(client),
    getCustomFieldsSchemas(client, {
      module: "Accounting",
    }),
  ]);

  if (accounts.error) {
    return redirect(
      path.to.authenticatedRoot,
      await flash(request, error(accounts.error, "Failed to fetch accounts"))
    );
  }

  if (customFields.error) {
    logger.error(customFields.error);
  }

  return json({
    baseCurrency: baseCurrency.data,
    balanceSheetAccounts:
      accounts.data.filter((a) => a.incomeBalance === "Balance Sheet") ?? [],
    incomeStatementAccounts:
      accounts.data.filter((a) => a.incomeBalance === "Income Statement") ?? [],
    customFields: customFields.data ?? [],
  });
}

export default function AccountingRoute() {
  const { groups } = useAccountingSubmodules();

  return (
    <div className="grid grid-cols-[auto_1fr] w-full h-full">
      <GroupedContentSidebar groups={groups} />
      <VStack spacing={0} className="h-full">
        <Outlet />
      </VStack>
    </div>
  );
}
