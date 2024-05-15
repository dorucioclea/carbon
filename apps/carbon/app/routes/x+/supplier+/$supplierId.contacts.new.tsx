import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { getSupabaseServiceRole } from "~/lib/supabase";
import {
  SupplierContactForm,
  insertSupplierContact,
  supplierContactValidator,
} from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost, notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { companyId } = await requirePermissions(request, {
    create: "purchasing",
  });

  // RLS doesn't work for selecting a contact with no supplier
  const client = getSupabaseServiceRole();

  const { supplierId } = params;
  if (!supplierId) throw notFound("supplierId not found");

  const formData = await request.formData();
  const modal = formData.get("type") === "modal";

  const validation = await validator(supplierContactValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, contactId, ...contact } = validation.data;

  const createSupplierContact = await insertSupplierContact(client, {
    supplierId,
    companyId,
    contact,
    customFields: setCustomFields(formData),
  });
  if (createSupplierContact.error) {
    return modal
      ? json(createSupplierContact)
      : redirect(
          path.to.supplierContacts(supplierId),
          await flash(
            request,
            error(
              createSupplierContact.error,
              "Failed to create supplier contact"
            )
          )
        );
  }

  return modal
    ? json(createSupplierContact)
    : redirect(
        path.to.supplierContacts(supplierId),
        await flash(request, success("Supplier contact created"))
      );
}

export default function SupplierContactsNewRoute() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  if (!supplierId) throw new Error("supplierId not found");

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
  };

  return (
    <SupplierContactForm
      supplierId={supplierId}
      initialValues={initialValues}
      onClose={() => navigate(path.to.supplierContacts(supplierId))}
    />
  );
}
