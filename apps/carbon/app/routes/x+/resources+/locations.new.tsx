import { validationError, validator } from "@carbon/remix-validated-form";
import { getLocalTimeZone } from "@internationalized/date";
import { useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import {
  LocationForm,
  locationValidator,
  upsertLocation,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "resources",
  });

  const formData = await request.formData();
  const modal = formData.get("type") === "modal";

  const validation = await validator(locationValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createLocation = await upsertLocation(client, {
    ...data,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });

  if (createLocation.error) {
    return modal
      ? json(createLocation)
      : redirect(
          path.to.locations,
          await flash(
            request,
            error(createLocation.error, "Failed to create location.")
          )
        );
  }

  return modal
    ? json(createLocation, { status: 201 })
    : redirect(
        path.to.locations,
        await flash(request, success("Location created"))
      );
}

export default function NewLocationRoute() {
  const navigate = useNavigate();
  const onClose = () => navigate(path.to.locations);

  const initialValues = {
    name: "",
    timezone: getLocalTimeZone(),
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  };

  return <LocationForm initialValues={initialValues} onClose={onClose} />;
}
