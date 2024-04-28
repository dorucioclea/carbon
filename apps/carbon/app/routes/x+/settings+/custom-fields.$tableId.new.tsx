import { json, redirect, useNavigate, useParams } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import type { AttributeDataType } from "~/modules/resources";
import { CustomFieldForm, customFieldValidator } from "~/modules/settings";
import { DataType } from "~/modules/shared";
import { getParams, path } from "~/utils/path";

import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { upsertCustomField } from "~/modules/settings/settings.server";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { error } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
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

  const create = await upsertCustomField(client, {
    ...data,
    companyId,
    createdBy: userId,
  });
  if (create.error) {
    return json(
      {},
      await flash(request, error(create.error, "Failed to insert custom field"))
    );
  }

  throw redirect(`${path.to.customFieldList(tableId)}?${getParams(request)}`);
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
