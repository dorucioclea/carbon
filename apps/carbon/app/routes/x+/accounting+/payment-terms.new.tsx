import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { PaymentTermCalculationMethod } from "~/modules/accounting";
import {
  PaymentTermForm,
  paymentTermValidator,
  upsertPaymentTerm,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    create: "accounting",
  });

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "accounting",
  });

  const formData = await request.formData();
  const validation = await validator(paymentTermValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { name, daysDue, daysDiscount, discountPercentage, calculationMethod } =
    validation.data;

  const insertPaymentTerm = await upsertPaymentTerm(client, {
    name,
    daysDue,
    daysDiscount,
    discountPercentage,
    calculationMethod,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });
  if (insertPaymentTerm.error) {
    return json(
      {},
      await flash(
        request,
        error(insertPaymentTerm.error, "Failed to insert payment term")
      )
    );
  }

  const paymentTermId = insertPaymentTerm.data?.id;
  if (!paymentTermId) {
    return json(
      {},
      await flash(
        request,
        error(insertPaymentTerm, "Failed to insert payment term")
      )
    );
  }

  throw redirect(
    `${path.to.paymentTerms}?${getParams(request)}`,
    await flash(request, success("Payment term created"))
  );
}

export default function NewPaymentTermsRoute() {
  const initialValues = {
    name: "",
    daysDue: 0,
    daysDiscount: 0,
    discountPercentage: 0,
    calculationMethod: "Net" as PaymentTermCalculationMethod,
  };

  return <PaymentTermForm initialValues={initialValues} />;
}
