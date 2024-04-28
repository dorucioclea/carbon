import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  getShippingMethodsList,
  getShippingTermsList,
} from "~/modules/inventory";
import {
  SalesOrderShipmentForm,
  getSalesOrderShipment,
  salesOrderShipmentValidator,
  upsertSalesOrderShipment,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { ListItem } from "~/types";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "sales",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const [salesOrderShipment, shippingMethods, shippingTerms] =
    await Promise.all([
      getSalesOrderShipment(client, orderId),
      getShippingMethodsList(client, companyId),
      getShippingTermsList(client, companyId),
    ]);

  if (salesOrderShipment.error) {
    throw redirect(
      path.to.salesOrder(orderId),
      await flash(
        request,
        error(salesOrderShipment.error, "Failed to load sales order shipment")
      )
    );
  }

  if (shippingMethods.error) {
    throw redirect(
      path.to.salesOrders,
      await flash(
        request,
        error(shippingMethods.error, "Failed to load shipping methods")
      )
    );
  }

  if (shippingTerms.error) {
    throw redirect(
      path.to.salesOrders,
      await flash(
        request,
        error(shippingTerms.error, "Failed to load shipping terms")
      )
    );
  }

  return json({
    salesOrderShipment: salesOrderShipment.data,
    shippingMethods: shippingMethods.data ?? [],
    shippingTerms: shippingTerms.data ?? [],
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "sales",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const formData = await request.formData();
  const validation = await validator(salesOrderShipmentValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updateSalesOrderShipment = await upsertSalesOrderShipment(client, {
    ...validation.data,
    id: orderId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updateSalesOrderShipment.error) {
    throw redirect(
      path.to.salesOrderShipment(orderId),
      await flash(
        request,
        error(
          updateSalesOrderShipment.error,
          "Failed to update sales order shipment"
        )
      )
    );
  }

  throw redirect(
    path.to.salesOrderShipment(orderId),
    await flash(request, success("Updated sales order shipment"))
  );
}

export default function SalesOrderShipmentRoute() {
  const { salesOrderShipment, shippingMethods, shippingTerms } =
    useLoaderData<typeof loader>();

  const initialValues = {
    id: salesOrderShipment.id,
    locationId: salesOrderShipment.locationId ?? "",
    shippingMethodId: salesOrderShipment.shippingMethodId ?? "",
    shippingTermId: salesOrderShipment.shippingTermId ?? "",
    trackingNumber: salesOrderShipment.trackingNumber ?? "",
    receiptRequestedDate: salesOrderShipment.receiptRequestedDate ?? "",
    receiptPromisedDate: salesOrderShipment.receiptPromisedDate ?? "",
    shipmentDate: salesOrderShipment.shipmentDate ?? "",
    notes: salesOrderShipment.notes ?? "",
    dropShipment: salesOrderShipment.dropShipment ?? false,
    customerId: salesOrderShipment.customerId ?? "",
    customerLocationId: salesOrderShipment.customerLocationId ?? "",
    ...getCustomFields(salesOrderShipment.customFields),
  };

  return (
    <SalesOrderShipmentForm
      key={initialValues.id}
      initialValues={initialValues}
      shippingMethods={shippingMethods as ListItem[]}
      shippingTerms={shippingTerms as ListItem[]}
    />
  );
}
