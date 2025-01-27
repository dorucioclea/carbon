import { Card, CardContent, CardHeader, CardTitle } from "@carbon/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { validationError, validator } from "@carbon/remix-validated-form";
import type { PrivateAttributes } from "~/modules/account";
import { UserAttributesForm, getPrivateAttributes } from "~/modules/account";
import { employeeJobValidator, updateEmployeeJob } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "resources",
  });

  const { personId } = params;
  if (!personId) throw new Error("Could not find personId");

  const privateAttributes = await getPrivateAttributes(
    client,
    personId,
    companyId
  );
  if (privateAttributes.error) {
    throw redirect(
      path.to.people,
      await flash(
        request,
        error(privateAttributes.error, "Failed to load private attributes")
      )
    );
  }

  return json({
    privateAttributes: privateAttributes.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
    update: "resources",
  });
  const { personId } = params;
  if (!personId) throw new Error("No person ID provided");

  const validation = await validator(employeeJobValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updateJob = await updateEmployeeJob(client, personId, {
    ...validation.data,
    companyId,
    updatedBy: userId,
  });
  if (updateJob.error) {
    throw redirect(
      path.to.personJob(personId),
      await flash(request, error(updateJob.error, "Failed to update job"))
    );
  }

  throw redirect(
    path.to.personJob(personId),
    await flash(request, success("Successfully updated job"))
  );
}

export default function PersonPrivateRoute() {
  const { privateAttributes } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col space-y-8">
      {privateAttributes.length ? (
        privateAttributes.map((category: PrivateAttributes) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserAttributesForm attributeCategory={category} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-muted-foreground w-full text-center py-16">
            No private attributes
          </CardContent>
        </Card>
      )}
    </div>
  );
}
