import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import {
  PartInventoryForm,
  getPartInventory,
  getPartQuantities,
  getShelvesList,
  partInventoryValidator,
  upsertPartInventory,
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

  let [partInventory, shelves] = await Promise.all([
    getPartInventory(client, partId, companyId, locationId),
    getShelvesList(client, locationId),
  ]);

  if (partInventory.error || !partInventory.data) {
    const insertPartInventory = await upsertPartInventory(client, {
      partId,
      companyId,
      locationId,
      customFields: {},
      createdBy: userId,
    });

    if (insertPartInventory.error) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(insertPartInventory.error, "Failed to insert part inventory")
        )
      );
    }

    partInventory = await getPartInventory(
      client,
      partId,
      companyId,
      locationId
    );
    if (partInventory.error || !partInventory.data) {
      throw redirect(
        path.to.part(partId),
        await flash(
          request,
          error(partInventory.error, "Failed to load part inventory")
        )
      );
    }
  }

  if (shelves.error) {
    throw redirect(
      path.to.parts,
      await flash(request, error(shelves.error, "Failed to load shelves"))
    );
  }

  const quantities = await getPartQuantities(
    client,
    partId,
    companyId,
    locationId
  );
  if (quantities.error || !quantities.data) {
    throw redirect(
      path.to.parts,
      await flash(request, error(quantities, "Failed to load part quantities"))
    );
  }

  return json({
    partInventory: partInventory.data,
    quantities: quantities.data,
    shelves: shelves.data.map((s) => s.id),
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
  // validate with partsValidator
  const validation = await validator(partInventoryValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { ...update } = validation.data;

  const updatePartInventory = await upsertPartInventory(client, {
    ...update,
    partId,
    customFields: setCustomFields(formData),
    updatedBy: userId,
  });
  if (updatePartInventory.error) {
    throw redirect(
      path.to.part(partId),
      await flash(
        request,
        error(updatePartInventory.error, "Failed to update part inventory")
      )
    );
  }

  throw redirect(
    path.to.partInventoryLocation(partId, update.locationId),
    await flash(request, success("Updated part inventory"))
  );
}

export default function PartInventoryRoute() {
  const sharedPartsData = useRouteData<{ locations: ListItem[] }>(
    path.to.partRoot
  );
  const { partInventory, quantities, shelves } = useLoaderData<typeof loader>();

  const initialValues = {
    ...partInventory,
    defaultShelfId: partInventory.defaultShelfId ?? undefined,
    ...getCustomFields(partInventory.customFields ?? {}),
  };
  return (
    <PartInventoryForm
      key={initialValues.partId}
      initialValues={initialValues}
      quantities={quantities}
      locations={sharedPartsData?.locations ?? []}
      shelves={shelves}
    />
  );
}
