import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { deleteCustomerStatus, getCustomerStatus } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { notFound } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
    role: "employee",
  });
  const { customerStatusId } = params;
  if (!customerStatusId) throw notFound("customerStatusId not found");

  const customerStatus = await getCustomerStatus(client, customerStatusId);
  if (customerStatus.error) {
    throw redirect(
      `${path.to.customerStatuses}?${getParams(request)}`,
      await flash(
        request,
        error(customerStatus.error, "Failed to get customer status")
      )
    );
  }

  return json({ customerStatus: customerStatus.data });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "sales",
  });

  const { customerStatusId } = params;
  if (!customerStatusId) {
    throw redirect(
      `${path.to.customerStatuses}?${getParams(request)}`,
      await flash(request, error(params, "Failed to get an customer status id"))
    );
  }

  const { error: deleteStatusError } = await deleteCustomerStatus(
    client,
    customerStatusId
  );
  if (deleteStatusError) {
    throw redirect(
      `${path.to.customerStatuses}?${getParams(request)}`,
      await flash(
        request,
        error(deleteStatusError, "Failed to delete customer status")
      )
    );
  }

  throw redirect(
    `${path.to.customerStatuses}?${getParams(request)}`,
    await flash(request, success("Successfully deleted customer status"))
  );
}

export default function DeleteCustomerStatusRoute() {
  const { customerStatusId } = useParams();
  const { customerStatus } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!customerStatus) return null;
  if (!customerStatusId) throw notFound("customerStatusId not found");

  const onCancel = () => navigate(path.to.customerStatuses);
  return (
    <ConfirmDelete
      action={path.to.deleteCustomerStatus(customerStatusId)}
      name={customerStatus.name}
      text={`Are you sure you want to delete the customer status: ${customerStatus.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
