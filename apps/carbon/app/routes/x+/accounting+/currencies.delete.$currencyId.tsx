import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { deleteCurrency, getCurrency } from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { notFound } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
  });
  const { currencyId } = params;
  if (!currencyId) throw notFound("currencyId not found");

  const currency = await getCurrency(client, currencyId);
  if (currency.error) {
    throw redirect(
      path.to.currencies,
      await flash(request, error(currency.error, "Failed to get currency"))
    );
  }

  return json({ currency: currency.data });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "accounting",
  });

  const { currencyId } = params;
  if (!currencyId) {
    throw redirect(
      `${path.to.currencies}?${getParams(request)}`,
      await flash(request, error(params, "Failed to get an currency id"))
    );
  }

  const { error: deleteTypeError } = await deleteCurrency(client, currencyId);
  if (deleteTypeError) {
    throw redirect(
      `${path.to.currencies}?${getParams(request)}`,
      await flash(request, error(deleteTypeError, "Failed to delete currency"))
    );
  }

  throw redirect(
    `${path.to.currencies}?${getParams(request)}`,
    await flash(request, success("Successfully deleted currency"))
  );
}

export default function DeleteCurrencyRoute() {
  const { currencyId } = useParams();
  const { currency } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!currencyId || !currency) return null; // TODO - handle this better (404?)

  const onCancel = () => navigate(path.to.currencies);

  return (
    <ConfirmDelete
      action={path.to.deleteCurrency(currencyId)}
      name={currency.name}
      text={`Are you sure you want to delete the currency: ${currency.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
