import { json, redirect, useNavigate, useParams } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import type { AttributeDataType } from "~/modules/resources";
import {
  CustomFieldForm,
  customFieldValidator,
  insertCustomField,
} from "~/modules/settings";
import { DataType } from "~/modules/shared";
import { path } from "~/utils/path";

import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "settings",
  });

  const { tableId } = params;
  if (!tableId) throw new Error("tableId is not found");

  const validation = await validator(customFieldValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createCustomField = await insertCustomField(client, {
    ...data,
    createdBy: userId,
  });
  if (createCustomField.error) {
    return json(
      {},
      await flash(
        request,
        error(createCustomField.error, "Failed to create custom field")
      )
    );
  }

  return redirect(path.to.customFields);
}

export default function NewCustomFieldRoute() {
  const { tableId } = useParams();
  if (!tableId) throw new Error("tableId is not found");

  const navigate = useNavigate();
  const onClose = () => navigate(-1);
  const routeData = useRouteData<{
    dataTypes: AttributeDataType[];
  }>(path.to.customFields);

  return (
    <CustomFieldForm
      initialValues={{
        name: "",
        // @ts-ignore
        dataTypeId: DataType.Text.toString(),
        customFieldTableId: tableId,
      }}
      dataTypes={routeData?.dataTypes ?? []}
      onClose={onClose}
    />
  );
}
