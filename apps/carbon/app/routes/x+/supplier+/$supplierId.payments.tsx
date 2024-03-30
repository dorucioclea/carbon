import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  SupplierPaymentForm,
  getSupplierPayment,
  supplierPaymentValidator,
  updateSupplierPayment,
} from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "purchasing",
  });

  const { supplierId } = params;
  if (!supplierId) throw new Error("Could not find supplierId");

  const supplierPayment = await getSupplierPayment(client, supplierId);

  if (supplierPayment.error || !supplierPayment.data) {
    throw redirect(
      path.to.supplier(supplierId),
      await flash(
        request,
        error(supplierPayment.error, "Failed to load supplier payment")
      )
    );
  }

  return json({
    supplierPayment: supplierPayment.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "purchasing",
  });

  const { supplierId } = params;
  if (!supplierId) throw new Error("Could not find supplierId");

  const formData = await request.formData();
  const validation = await validator(supplierPaymentValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const update = await updateSupplierPayment(client, {
    ...validation.data,
    supplierId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (update.error) {
    throw redirect(
      path.to.supplier(supplierId),
      await flash(
        request,
        error(update.error, "Failed to update supplier payment")
      )
    );
  }

  throw redirect(
    path.to.supplierPayment(supplierId),
    await flash(request, success("Updated supplier payment"))
  );
}

export default function SupplierPaymentRoute() {
  const { supplierPayment } = useLoaderData<typeof loader>();
  const initialValues = {
    supplierId: supplierPayment?.supplierId ?? "",
    invoiceSupplierId: supplierPayment?.invoiceSupplierId ?? "",
    invoiceSupplierContactId: supplierPayment?.invoiceSupplierContactId ?? "",
    invoiceSupplierLocationId: supplierPayment?.invoiceSupplierLocationId ?? "",
    paymentTermId: supplierPayment?.paymentTermId ?? "",
    currencyCode: supplierPayment?.currencyCode ?? "",
    ...getCustomFields(supplierPayment?.customFields),
  };

  return (
    <SupplierPaymentForm
      key={initialValues.supplierId}
      initialValues={initialValues}
    />
  );
}
