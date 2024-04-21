import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  PartGroupForm,
  partGroupValidator,
  upsertPartGroup,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    create: "parts",
  });

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "parts",
  });

  const formData = await request.formData();
  const modal = formData.get("type") == "modal";

  const validation = await validator(partGroupValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const insertPartGroup = await upsertPartGroup(client, {
    ...data,
    createdBy: userId,
    customFields: setCustomFields(formData),
  });
  if (insertPartGroup.error) {
    return json(
      {},
      await flash(
        request,
        error(insertPartGroup.error, "Failed to insert part group")
      )
    );
  }

  const partGroupId = insertPartGroup.data?.id;
  if (!partGroupId) {
    return json(
      {},
      await flash(
        request,
        error(insertPartGroup, "Failed to insert part group")
      )
    );
  }

  return modal
    ? json(insertPartGroup, { status: 201 })
    : redirect(
        `${path.to.partGroups}?${getParams(request)}`,
        await flash(request, success("Part group created"))
      );
}

export default function NewPartGroupsRoute() {
  const navigate = useNavigate();
  const initialValues = {
    name: "",
    description: "",
  };

  return (
    <PartGroupForm onClose={() => navigate(-1)} initialValues={initialValues} />
  );
}
