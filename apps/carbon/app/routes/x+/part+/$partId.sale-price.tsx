import { validationError, validator } from "@carbon/remix-validated-form";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  PartSalePriceForm,
  getPartUnitSalePrice,
  partUnitSalePriceValidator,
  upsertPartUnitSalePrice,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const [partUnitSalePrice] = await Promise.all([
    getPartUnitSalePrice(client, partId),
  ]);

  if (partUnitSalePrice.error) {
    return redirect(
      path.to.parts,
      await flash(
        request,
        error(partUnitSalePrice.error, "Failed to load part unit sale price")
      )
    );
  }

  return json({
    partUnitSalePrice: partUnitSalePrice.data,
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
  const validation = await validator(partUnitSalePriceValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePartUnitSalePrice = await upsertPartUnitSalePrice(client, {
    ...validation.data,
    partId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updatePartUnitSalePrice.error) {
    return redirect(
      path.to.part(partId),
      await flash(
        request,
        error(updatePartUnitSalePrice.error, "Failed to update part sale price")
      )
    );
  }

  return redirect(
    path.to.partSalePrice(partId),
    await flash(request, success("Updated part sale price"))
  );
}

export default function PartSalePriceRoute() {
  const { partUnitSalePrice } = useLoaderData<typeof loader>();

  const initialValues = {
    ...partUnitSalePrice,
    salesUnitOfMeasureCode: partUnitSalePrice?.salesUnitOfMeasureCode ?? "",
    ...getCustomFields(partUnitSalePrice.customFields),
  };

  return (
    <PartSalePriceForm
      key={initialValues.partId}
      initialValues={initialValues}
    />
  );
}
