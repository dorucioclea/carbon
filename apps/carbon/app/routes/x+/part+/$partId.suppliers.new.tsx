import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import {
  PartSupplierForm,
  partSupplierValidator,
  upsertPartSupplier,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
    create: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const formData = await request.formData();
  const validation = await validator(partSupplierValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createPartSupplier = await upsertPartSupplier(client, {
    ...data,
    companyId,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });

  if (createPartSupplier.error) {
    throw redirect(
      path.to.partSuppliers(partId),
      await flash(
        request,
        error(createPartSupplier.error, "Failed to create part supplier")
      )
    );
  }

  throw redirect(path.to.partSuppliers(partId));
}

export default function NewPartSupplierRoute() {
  const { partId } = useParams();

  if (!partId) throw new Error("partId not found");

  const initialValues = {
    partId: partId,
    supplierId: "",
    supplierPartId: "",
    unitPrice: 0,
    supplierUnitOfMeasureCode: "EA",
    minimumOrderQuantity: 1,
    conversionFactor: 1,
  };

  return <PartSupplierForm initialValues={initialValues} />;
}
