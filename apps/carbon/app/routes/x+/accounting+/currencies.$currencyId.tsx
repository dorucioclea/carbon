import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  CurrencyForm,
  currencyValidator,
  getCurrency,
  upsertCurrency,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost, notFound } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
    role: "employee",
  });

  const { currencyId } = params;
  if (!currencyId) throw notFound("currencyId not found");

  const currency = await getCurrency(client, currencyId);

  return json({
    currency: currency?.data ?? null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "accounting",
  });

  const formData = await request.formData();
  const validation = await validator(currencyValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;
  if (!id) throw new Error("id not found");

  const updateCurrency = await upsertCurrency(client, {
    id,
    ...data,
    customFields: setCustomFields(formData),
    updatedBy: userId,
  });

  if (updateCurrency.error) {
    return json(
      {},
      await flash(
        request,
        error(updateCurrency.error, "Failed to update currency")
      )
    );
  }

  throw redirect(
    `${path.to.currencies}?${getParams(request)}`,
    await flash(request, success("Updated currency"))
  );
}

export default function EditCurrencysRoute() {
  const { currency } = useLoaderData<typeof loader>();

  const initialValues = {
    id: currency?.id ?? undefined,
    name: currency?.name ?? "",
    code: currency?.code ?? "",
    symbol: currency?.symbol ?? "",
    exchangeRate: currency?.exchangeRate ?? 1,
    decimalPlaces: currency?.decimalPlaces ?? 2,
    isBaseCurrency: currency?.isBaseCurrency ?? false,
    ...getCustomFields(currency?.customFields),
  };

  return <CurrencyForm key={initialValues.id} initialValues={initialValues} />;
}
