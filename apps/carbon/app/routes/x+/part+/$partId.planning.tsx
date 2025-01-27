import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import {
  PartPlanningForm,
  getPartPlanning,
  partPlanningValidator,
  upsertPartPlanning,
} from "~/modules/parts";
import { getLocationsList } from "~/modules/resources";
import { getUserDefaults } from "~/modules/users/users.server";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { ListItem } from "~/types";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  let locationId = searchParams.get("location");

  if (!locationId) {
    const userDefaults = await getUserDefaults(client, userId, companyId);
    if (userDefaults.error) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(userDefaults.error, "Failed to load default location")
        )
      );
    }

    locationId = userDefaults.data?.locationId ?? null;
  }

  if (!locationId) {
    const locations = await getLocationsList(client, companyId);
    if (locations.error || !locations.data?.length) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(locations.error, "Failed to load any locations")
        )
      );
    }
    locationId = locations.data?.[0].id as string;
  }

  let partPlanning = await getPartPlanning(
    client,
    partId,
    companyId,
    locationId
  );

  if (partPlanning.error || !partPlanning.data) {
    const insertPartPlanning = await upsertPartPlanning(client, {
      partId,
      companyId,
      locationId,
      createdBy: userId,
    });

    if (insertPartPlanning.error) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(insertPartPlanning.error, "Failed to insert part planning")
        )
      );
    }

    partPlanning = await getPartPlanning(client, partId, companyId, locationId);
    if (partPlanning.error || !partPlanning.data) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(partPlanning.error, "Failed to load part planning")
        )
      );
    }
  }

  return json({
    partPlanning: partPlanning.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const formData = await request.formData();
  const validation = await validator(partPlanningValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePartPlanning = await upsertPartPlanning(client, {
    ...validation.data,
    partId,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });
  if (updatePartPlanning.error) {
    throw redirect(
      path.to.part(partId),
      await flash(
        request,
        error(updatePartPlanning.error, "Failed to update part planning")
      )
    );
  }

  throw redirect(
    path.to.partPlanningLocation(partId, validation.data.locationId),
    await flash(request, success("Updated part planning"))
  );
}

export default function PartPlanningRoute() {
  const sharedPartsData = useRouteData<{
    locations: ListItem[];
  }>(path.to.partRoot);

  const { partPlanning } = useLoaderData<typeof loader>();

  if (!sharedPartsData) throw new Error("Could not load shared parts data");

  return (
    <PartPlanningForm
      key={partPlanning.partId}
      initialValues={{
        ...partPlanning,
        ...getCustomFields(partPlanning.customFields),
      }}
      locations={sharedPartsData.locations ?? []}
    />
  );
}
