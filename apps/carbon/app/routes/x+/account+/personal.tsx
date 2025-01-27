import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VStack,
} from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { PrivateAttributes } from "~/modules/account";
import { UserAttributesForm, getPrivateAttributes } from "~/modules/account";
import { requirePermissions } from "~/services/auth/auth.server";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Personal",
  to: path.to.accountPersonal,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {});

  const [privateAttributes] = await Promise.all([
    getPrivateAttributes(client, userId, companyId),
  ]);

  if (privateAttributes.error) {
    throw redirect(
      path.to.authenticatedRoot,
      await flash(
        request,
        error(privateAttributes.error, "Failed to get user attributes")
      )
    );
  }

  return json({ attributes: privateAttributes.data });
}

export default function AccountPersonal() {
  const { attributes } = useLoaderData<typeof loader>();
  return (
    <VStack spacing={4}>
      {attributes.length ? (
        attributes.map((category: PrivateAttributes) => (
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
          <CardContent className="text-muted-foreground w-full py-8 text-center">
            No private attributes
          </CardContent>
        </Card>
      )}
    </VStack>
  );
}
