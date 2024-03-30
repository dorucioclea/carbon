import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import {
  ServiceSupplierForm,
  serviceSupplierValidator,
  upsertServiceSupplier,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "parts",
  });

  const { serviceId } = params;
  if (!serviceId) throw new Error("Could not find serviceId");

  const formData = await request.formData();
  const validation = await validator(serviceSupplierValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createServiceSupplier = await upsertServiceSupplier(client, {
    ...data,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });

  if (createServiceSupplier.error) {
    throw redirect(
      path.to.serviceSuppliers(serviceId),
      await flash(
        request,
        error(createServiceSupplier.error, "Failed to create service supplier.")
      )
    );
  }

  throw redirect(path.to.serviceSuppliers(serviceId));
}

export default function NewServiceSupplierRoute() {
  const { serviceId } = useParams();

  if (!serviceId) throw new Error("serviceId not found");

  const initialValues = {
    serviceId,
    supplierId: "",
    supplierServiceId: "",
  };

  return <ServiceSupplierForm initialValues={initialValues} />;
}
