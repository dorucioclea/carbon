import { validationError, validator } from "@carbon/remix-validated-form";
import { getLocalTimeZone } from "@internationalized/date";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  LocationForm,
  getLocation,
  locationValidator,
  upsertLocation,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost, notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
  });

  const { locationId } = params;
  if (!locationId) throw notFound("Location ID was not found");

  const location = await getLocation(client, locationId);

  if (location.error) {
    throw redirect(
      path.to.locations,
      await flash(request, error(location.error, "Failed to get location"))
    );
  }

  return json({
    location: location.data,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "resources",
  });

  const formData = await request.formData();
  const validation = await validator(locationValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;
  if (!id) throw notFound("Location ID was not found");

  const createLocation = await upsertLocation(client, {
    id,
    ...data,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });

  if (createLocation.error) {
    throw redirect(
      path.to.locations,
      await flash(
        request,
        error(createLocation.error, "Failed to create location.")
      )
    );
  }

  throw redirect(
    path.to.locations,
    await flash(request, success("Location updated."))
  );
}

export default function LocationRoute() {
  const { location } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const initialValues = {
    id: location.id,
    name: location.name,
    addressLine1: location.addressLine1 ?? undefined,
    addressLine2: location.addressLine2 ?? undefined,
    city: location.city ?? undefined,
    state: location.state ?? undefined,
    postalCode: location.postalCode ?? undefined,
    timezone: location.timezone ?? getLocalTimeZone(),
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
    ...getCustomFields(location.customFields),
  };

  return <LocationForm initialValues={initialValues} onClose={onClose} />;
}
