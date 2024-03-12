import {
  json,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useRouteData } from "~/hooks";
import type { AttributeDataType } from "~/modules/resources";
import {
  CustomFieldForm,
  customFieldValidator,
  getCustomField,
  updateCustomField,
} from "~/modules/settings";
import { DataType } from "~/modules/shared";
import { path } from "~/utils/path";

import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost, notFound } from "~/utils/http";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "settings",
    role: "employee",
  });

  const { tableId, id } = params;
  if (!tableId) throw notFound("Invalid tableId");
  if (!id) throw new Error("id is not found");

  const customField = await getCustomField(client, id);
  if (customField.error) {
    return redirect(
      path.to.customFieldList(tableId),
      await flash(
        request,
        error(customField.error, "Failed to fetch custom fields")
      )
    );
  }

  return json({ customField: customField.data });
}

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
  if (!id) throw new Error("id is not found");

  const update = await updateCustomField(client, {
    id,
    ...data,
    updatedBy: userId,
  });
  if (update.error) {
    return json(
      {},
      await flash(request, error(update.error, "Failed to update custom field"))
    );
  }

  return redirect(path.to.customFields);
}

export default function UpdateCustomFieldRoute() {
  const { customField } = useLoaderData<typeof loader>();
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
        id: customField.id,
        name: customField.name,
        // @ts-ignore
        dataTypeId: (customField.dataTypeId || DataType.Text).toString(),
        customFieldTableId: tableId,
      }}
      dataTypes={routeData?.dataTypes ?? []}
      onClose={onClose}
    />
  );
}
