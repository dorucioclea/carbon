import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { getSupabaseServiceRole } from "~/lib/supabase";
import {
  CustomerContactForm,
  customerContactValidator,
  insertCustomerContact,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost, notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  await requirePermissions(request, {
    create: "sales",
  });

  // RLS doesn't work for selecting a contact with no customer
  const client = getSupabaseServiceRole();

  const { customerId } = params;
  if (!customerId) throw notFound("customerId not found");

  const formData = await request.formData();
  const modal = formData.get("type") === "modal";

  const validation = await validator(customerContactValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, contactId, ...contact } = validation.data;

  const createCustomerContact = await insertCustomerContact(client, {
    customerId,
    contact,
    customFields: setCustomFields(formData),
  });
  if (createCustomerContact.error) {
    return modal
      ? json(createCustomerContact)
      : redirect(
          path.to.customerContacts(customerId),
          await flash(
            request,
            error(
              createCustomerContact.error,
              "Failed to create customer contact"
            )
          )
        );
  }

  return modal
    ? json(createCustomerContact, { status: 201 })
    : redirect(
        path.to.customerContacts(customerId),
        await flash(request, success("Customer contact created"))
      );
}

export default function CustomerContactsNewRoute() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  if (!customerId) throw new Error("customerId not found");

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
  };

  return (
    <CustomerContactForm
      customerId={customerId}
      initialValues={initialValues}
      onClose={() => navigate(path.to.customerContacts(customerId))}
    />
  );
}
