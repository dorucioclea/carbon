import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAccountsList } from "~/modules/accounting";
import {
  PartCostingForm,
  getPartCost,
  partCostValidator,
  upsertPartCost,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const [partCost, accounts] = await Promise.all([
    getPartCost(client, partId, companyId),
    getAccountsList(client, companyId),
  ]);

  if (partCost.error) {
    throw redirect(
      path.to.parts,
      await flash(request, error(partCost.error, "Failed to load part costing"))
    );
  }
  if (accounts.error) {
    throw redirect(
      path.to.parts,
      await flash(request, error(accounts.error, "Failed to load accounts"))
    );
  }

  return json({
    partCost: partCost.data,
    accounts: accounts.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const formData = await request.formData();
  const validation = await validator(partCostValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePartCost = await upsertPartCost(client, {
    ...validation.data,
    partId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updatePartCost.error) {
    throw redirect(
      path.to.part(partId),
      await flash(
        request,
        error(updatePartCost.error, "Failed to update part costing")
      )
    );
  }

  throw redirect(
    path.to.partCosting(partId),
    await flash(request, success("Updated part costing"))
  );
}

export default function PartCostingRoute() {
  const { partCost } = useLoaderData<typeof loader>();
  return (
    <PartCostingForm
      key={partCost.partId}
      initialValues={{ ...partCost, ...getCustomFields(partCost.customFields) }}
    />
  );
}
