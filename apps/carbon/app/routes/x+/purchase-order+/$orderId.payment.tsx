import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPaymentTermsList } from "~/modules/accounting";
import {
  PurchaseOrderPaymentForm,
  getPurchaseOrderPayment,
  purchaseOrderPaymentValidator,
  upsertPurchaseOrderPayment,
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

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const [purchaseOrderPayment, paymentTerms] = await Promise.all([
    getPurchaseOrderPayment(client, orderId),
    getPaymentTermsList(client),
  ]);

  if (purchaseOrderPayment.error) {
    throw redirect(
      path.to.purchaseOrder(orderId),
      await flash(
        request,
        error(
          purchaseOrderPayment.error,
          "Failed to load purchase order payment"
        )
      )
    );
  }

  if (paymentTerms.error) {
    throw redirect(
      path.to.purchaseOrders,
      await flash(
        request,
        error(paymentTerms.error, "Failed to load payment terms")
      )
    );
  }

  return json({
    purchaseOrderPayment: purchaseOrderPayment.data,
    paymentTerms: paymentTerms.data ?? [],
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "purchasing",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const formData = await request.formData();
  const validation = await validator(purchaseOrderPaymentValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePurchaseOrderPayment = await upsertPurchaseOrderPayment(client, {
    ...validation.data,
    id: orderId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updatePurchaseOrderPayment.error) {
    throw redirect(
      path.to.purchaseOrderPayment(orderId),
      await flash(
        request,
        error(
          updatePurchaseOrderPayment.error,
          "Failed to update purchase order payment"
        )
      )
    );
  }

  throw redirect(
    path.to.purchaseOrderPayment(orderId),
    await flash(request, success("Updated purchase order payment"))
  );
}

export default function PurchaseOrderPaymentRoute() {
  const { purchaseOrderPayment, paymentTerms } = useLoaderData<typeof loader>();

  const initialValues = {
    id: purchaseOrderPayment.id,
    invoiceSupplierId: purchaseOrderPayment.invoiceSupplierId ?? "",
    invoiceSupplierLocationId:
      purchaseOrderPayment.invoiceSupplierLocationId ?? undefined,
    invoiceSupplierContactId:
      purchaseOrderPayment.invoiceSupplierContactId ?? undefined,
    paymentTermId: purchaseOrderPayment.paymentTermId ?? undefined,
    paymentComplete: purchaseOrderPayment.paymentComplete ?? undefined,
    currencyCode: (purchaseOrderPayment.currencyCode ?? "USD") as "USD",
    ...getCustomFields(purchaseOrderPayment.customFields),
  };

  return (
    <PurchaseOrderPaymentForm
      key={initialValues.id}
      initialValues={initialValues}
      paymentTerms={paymentTerms}
    />
  );
}
