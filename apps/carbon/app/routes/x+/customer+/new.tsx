import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  CustomerForm,
  customerValidator,
  upsertCustomer,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
    create: "sales",
  });

  const formData = await request.formData();
  const modal = formData.get("type") === "modal";

  const validation = await validator(customerValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createCustomer = await upsertCustomer(client, {
    ...data,
    companyId,
    customFields: setCustomFields(formData),
    createdBy: userId,
  });
  if (createCustomer.error) {
    return modal
      ? json(
          createCustomer,
          await flash(
            request,
            error(createCustomer.error, "Failed to insert customer")
          )
        )
      : redirect(
          path.to.customers,
          await flash(
            request,
            error(createCustomer.error, "Failed to insert customer")
          )
        );
  }

  const customerId = createCustomer.data?.id;

  return modal ? json(createCustomer) : redirect(path.to.customer(customerId));
}

export default function CustomersNewRoute() {
  const initialValues = {
    name: "",
  };
  return (
    <div className="w-1/2 max-w-[720px] min-w-[420px] mx-auto">
      <CustomerForm initialValues={initialValues} />
    </div>
  );
}
